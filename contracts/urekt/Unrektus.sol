// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {IUniswapV2Factory} from "./interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";
import {Ownable} from "./access/Ownable.sol";

contract Unrektus is IERC20, Ownable {
    string private constant _TOKEN_NAME = "Unrektus";
    string private constant _TOKEN_SYMBOL = "uREKT";
    uint8 private constant _TOKEN_DECIMALS = 18;
    uint256 private _totalSupply = 4_000_000 * (10 ** _TOKEN_DECIMALS);

    uint256 public constant MAX_TAX_CAP = 8; // 8%
    uint256 public constant TAX_CHANGE_MAX_STEP = 1; // 1% per update
    uint256 public constant TAX_CHANGE_DELAY = 1 days;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) private _isExcludedFromFee;

    // Balanced profile defaults: 2% buy / 6% sell
    uint256 public buyTaxFee = 2;
    uint256 public sellTaxFee = 6;

    // Tax split defaults: 60% prize / 25% team / 15% LP
    uint256 public prizeShare = 60;
    uint256 public teamShare = 25;
    uint256 public lpShare = 15;

    address public prizePoolAddress = 0x460a56A7bBA41dC4460B49044f459B7D59094154;
    address public teamAddress = 0xC80731C21b5A9B3B5dB86F9abCBA49Dd1CF6ed6e;

    // 5 bps = 0.05%
    uint256 public swapThresholdBps = 5;
    uint256 private _swapThreshold = (_totalSupply * 5) / 10000;
    uint256 public swapCooldown = 10 minutes;
    uint256 public lastSwapTimestamp;

    IUniswapV2Router02 private _uniswapV2Router;
    address private _uniswapV2Pair;

    bool private _inSwap = false;
    bool public swapEnabled = true;

    struct PendingTaxUpdate {
        uint256 buyTax;
        uint256 sellTax;
        uint256 executeAfter;
        bool active;
    }

    PendingTaxUpdate public pendingTaxUpdate;

    event LiquidityAdded(uint256 tokenAmount, uint256 nativeAmount);
    event TaxUpdateScheduled(uint256 buyTax, uint256 sellTax, uint256 executeAfter);
    event TaxUpdateCancelled();
    event TaxUpdated(uint256 buyTax, uint256 sellTax);
    event TaxDistributionUpdated(uint256 prizeShare, uint256 teamShare, uint256 lpShare);
    event PrizePoolAddressUpdated(address indexed newAddress);
    event TeamAddressUpdated(address indexed newAddress);
    event SwapThresholdUpdated(uint256 threshold);
    event SwapThresholdBpsUpdated(uint256 bps, uint256 threshold);
    event SwapCooldownUpdated(uint256 cooldown);
    event SwapEnabledUpdated(bool enabled);
    event RouterConfigured(address indexed router, address indexed pair);

    modifier lockTheSwap() {
        _inSwap = true;
        _;
        _inSwap = false;
    }

    constructor(address routerAddress) Ownable(msg.sender) {
        require(routerAddress != address(0), "ZERO_ROUTER");
        _uniswapV2Router = IUniswapV2Router02(routerAddress);
        _uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory()).createPair(
            address(this),
            _uniswapV2Router.WETH()
        );
        require(_uniswapV2Pair != address(0), "Pair Address cannot be zero");
        emit RouterConfigured(routerAddress, _uniswapV2Pair);

        _approve(address(this), address(_uniswapV2Router), type(uint256).max);

        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;
        _isExcludedFromFee[prizePoolAddress] = true;
        _isExcludedFromFee[teamAddress] = true;

        _balances[_msgSender()] = _totalSupply;
        emit Transfer(address(0), _msgSender(), _totalSupply);
    }

    function name() external pure returns (string memory) {
        return _TOKEN_NAME;
    }

    function symbol() external pure returns (string memory) {
        return _TOKEN_SYMBOL;
    }

    function decimals() external pure returns (uint8) {
        return _TOKEN_DECIMALS;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner_, address spender) external view override returns (uint256) {
        return _allowances[owner_][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        _transfer(sender, recipient, amount);
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        _approve(sender, _msgSender(), currentAllowance - amount);
        return true;
    }

    function _approve(address owner_, address spender, uint256 amount) private {
        require(owner_ != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) private {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");

        uint256 taxAmount = 0;
        bool isBuy = from == _uniswapV2Pair;
        bool isSell = to == _uniswapV2Pair;

        if (!_isExcludedFromFee[from] && !_isExcludedFromFee[to]) {
            if (isBuy) {
                taxAmount = (amount * buyTaxFee) / 100;
            } else if (isSell) {
                taxAmount = (amount * sellTaxFee) / 100;
            }
        }

        uint256 contractTokenBalance = balanceOf(address(this));
        if (
            contractTokenBalance >= _swapThreshold &&
            !_inSwap &&
            isSell &&
            swapEnabled &&
            block.timestamp >= lastSwapTimestamp + swapCooldown &&
            !_isExcludedFromFee[from]
        ) {
            _swapBack(contractTokenBalance);
            lastSwapTimestamp = block.timestamp;
        }

        if (taxAmount > 0) {
            _balances[address(this)] = _balances[address(this)] + taxAmount;
            emit Transfer(from, address(this), taxAmount);
        }

        _balances[from] = _balances[from] - amount;
        _balances[to] = _balances[to] + (amount - taxAmount);
        emit Transfer(from, to, amount - taxAmount);
    }

    function _swapTokensForNative(uint256 tokenAmount, address receiverAddress) private lockTheSwap {
        if (tokenAmount == 0) return;

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = _uniswapV2Router.WETH();

        uint256 out = _uniswapV2Router.getAmountsOut(tokenAmount, path)[1];
        _uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            (out * 90) / 100,
            path,
            receiverAddress,
            block.timestamp + 360
        );
    }

    function _swapBack(uint256 tokenAmount) private {
        uint256 prizeTokens = (tokenAmount * prizeShare) / 100;
        uint256 teamTokens = (tokenAmount * teamShare) / 100;
        uint256 lpTokens = tokenAmount - prizeTokens - teamTokens;

        if (prizeTokens > 0) _swapTokensForNative(prizeTokens, prizePoolAddress);
        if (teamTokens > 0) _swapTokensForNative(teamTokens, teamAddress);

        if (lpTokens > 0) {
            uint256 lpHalf = lpTokens / 2;
            uint256 lpOtherHalf = lpTokens - lpHalf;
            uint256 balanceBefore = address(this).balance;
            _swapTokensForNative(lpHalf, address(this));
            uint256 nativeForLp = address(this).balance - balanceBefore;
            if (nativeForLp > 0 && lpOtherHalf > 0) {
                _uniswapV2Router.addLiquidityETH{value: nativeForLp}(
                    address(this),
                    lpOtherHalf,
                    0,
                    0,
                    address(this),
                    block.timestamp
                );
                emit LiquidityAdded(lpOtherHalf, nativeForLp);
            }
        }
    }

    function scheduleTaxUpdate(uint256 newBuyTax, uint256 newSellTax) external onlyOwner {
        require(newBuyTax <= MAX_TAX_CAP && newSellTax <= MAX_TAX_CAP, "TAX_CAP");
        require(
            _absDiff(newBuyTax, buyTaxFee) <= TAX_CHANGE_MAX_STEP &&
                _absDiff(newSellTax, sellTaxFee) <= TAX_CHANGE_MAX_STEP,
            "TAX_STEP"
        );

        uint256 executeAfter = block.timestamp + TAX_CHANGE_DELAY;
        pendingTaxUpdate = PendingTaxUpdate({
            buyTax: newBuyTax,
            sellTax: newSellTax,
            executeAfter: executeAfter,
            active: true
        });

        emit TaxUpdateScheduled(newBuyTax, newSellTax, executeAfter);
    }

    function executeTaxUpdate() external onlyOwner {
        require(pendingTaxUpdate.active, "NO_PENDING_TAX");
        require(block.timestamp >= pendingTaxUpdate.executeAfter, "TAX_TIMELOCK");

        buyTaxFee = pendingTaxUpdate.buyTax;
        sellTaxFee = pendingTaxUpdate.sellTax;
        delete pendingTaxUpdate;

        emit TaxUpdated(buyTaxFee, sellTaxFee);
    }

    function cancelTaxUpdate() external onlyOwner {
        require(pendingTaxUpdate.active, "NO_PENDING_TAX");
        delete pendingTaxUpdate;
        emit TaxUpdateCancelled();
    }

    function setTaxDistribution(uint256 newPrizeShare, uint256 newTeamShare, uint256 newLpShare) external onlyOwner {
        require(newPrizeShare + newTeamShare + newLpShare == 100, "BAD_SPLIT");
        prizeShare = newPrizeShare;
        teamShare = newTeamShare;
        lpShare = newLpShare;
        emit TaxDistributionUpdated(newPrizeShare, newTeamShare, newLpShare);
    }

    function setSwapThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "BAD_THRESHOLD");
        _swapThreshold = newThreshold;
        swapThresholdBps = (_swapThreshold * 10000) / _totalSupply;
        emit SwapThresholdUpdated(newThreshold);
        emit SwapThresholdBpsUpdated(swapThresholdBps, _swapThreshold);
    }

    function setThresholdBps(uint256 bps) external onlyOwner {
        require(bps > 0 && bps <= 1000, "BAD_BPS");
        swapThresholdBps = bps;
        _swapThreshold = (_totalSupply * bps) / 10000;
        if (_swapThreshold == 0) {
            _swapThreshold = 1;
        }
        emit SwapThresholdBpsUpdated(bps, _swapThreshold);
        emit SwapThresholdUpdated(_swapThreshold);
    }

    function setSwapCooldown(uint256 newCooldown) external onlyOwner {
        require(newCooldown <= 1 days, "COOLDOWN_TOO_LONG");
        swapCooldown = newCooldown;
        emit SwapCooldownUpdated(newCooldown);
    }

    function setSwapEnabled(bool enabled) external onlyOwner {
        swapEnabled = enabled;
        emit SwapEnabledUpdated(enabled);
    }

    function excludeFromFee(address account, bool excluded) external onlyOwner {
        _isExcludedFromFee[account] = excluded;
    }

    function updatePrizePoolAddress(address newAddress) external onlyOwner {
        require(newAddress != address(0), "ZERO_ADDRESS");
        prizePoolAddress = newAddress;
        emit PrizePoolAddressUpdated(newAddress);
    }

    function updateTeamAddress(address newAddress) external onlyOwner {
        require(newAddress != address(0), "ZERO_ADDRESS");
        teamAddress = newAddress;
        emit TeamAddressUpdated(newAddress);
    }

    function getPair() external view returns (address) {
        return _uniswapV2Pair;
    }

    function getRouter() external view returns (address) {
        return address(_uniswapV2Router);
    }

    function isExcludedFromFee(address account) external view returns (bool) {
        return _isExcludedFromFee[account];
    }

    function _absDiff(uint256 a, uint256 b) private pure returns (uint256) {
        return a > b ? a - b : b - a;
    }

    receive() external payable {}
}
