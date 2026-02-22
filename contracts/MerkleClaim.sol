// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
}

library SafeTransferLib {
    function safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20Minimal.transfer.selector, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
    }
}

library MerkleProofLib {
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            computedHash = _hashPair(computedHash, proofElement);
        }
        return computedHash == root;
    }

    function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }
}

contract MerkleClaim {
    using SafeTransferLib for address;

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public immutable claimEnd;
    uint256 public immutable totalClaimable;
    address public owner;
    uint256 public claimedTotal;

    mapping(address => bool) public claimed;

    event Claimed(address indexed account, uint256 amount);
    event OwnerUpdated(address indexed owner);
    event Swept(address indexed to, uint256 amount);
    event ExcessWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor(
        address token_,
        bytes32 merkleRoot_,
        uint256 claimEnd_,
        address owner_,
        uint256 totalClaimable_
    ) {
        require(token_ != address(0), "ZERO_TOKEN");
        require(merkleRoot_ != bytes32(0), "ZERO_ROOT");
        require(claimEnd_ > block.timestamp, "BAD_CLAIM_END");
        require(owner_ != address(0), "ZERO_OWNER");
        require(totalClaimable_ > 0, "ZERO_TOTAL");

        token = token_;
        merkleRoot = merkleRoot_;
        claimEnd = claimEnd_;
        owner = owner_;
        totalClaimable = totalClaimable_;
    }

    function setOwner(address owner_) external onlyOwner {
        require(owner_ != address(0), "ZERO_OWNER");
        owner = owner_;
        emit OwnerUpdated(owner_);
    }

    function claim(uint256 amount, bytes32[] calldata proof) external {
        require(block.timestamp <= claimEnd, "CLAIM_ENDED");
        require(!claimed[msg.sender], "ALREADY_CLAIMED");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProofLib.verify(proof, merkleRoot, leaf), "INVALID_PROOF");

        claimed[msg.sender] = true;
        claimedTotal += amount;
        token.safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amount);
    }

    function withdrawExcess(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "ZERO_TO");
        uint256 requiredReserve = totalClaimable - claimedTotal;
        uint256 balance = _tokenBalance();
        require(balance > requiredReserve, "NO_EXCESS");
        uint256 excess = balance - requiredReserve;
        require(amount <= excess, "AMOUNT_EXCEEDS_EXCESS");
        token.safeTransfer(to, amount);
        emit ExcessWithdrawn(to, amount);
    }

    function sweepUnclaimed(address to, uint256 amount) external onlyOwner {
        require(block.timestamp > claimEnd, "CLAIM_ACTIVE");
        token.safeTransfer(to, amount);
        emit Swept(to, amount);
    }

    function _tokenBalance() private view returns (uint256 balance) {
        (bool success, bytes memory data) = token.staticcall(abi.encodeWithSignature("balanceOf(address)", address(this)));
        require(success && data.length >= 32, "BALANCE_READ_FAILED");
        balance = abi.decode(data, (uint256));
    }
}
