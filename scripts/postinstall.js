const fs = require("fs");
const path = require("path");

const transferHelperPath = path.join(
  process.cwd(),
  "node_modules",
  "@uniswap",
  "lib",
  "contracts",
  "libraries",
  "TransferHelper.sol"
);
const uniswapLibraryPath = path.join(
  process.cwd(),
  "node_modules",
  "@uniswap",
  "v2-periphery",
  "contracts",
  "libraries",
  "UniswapV2Library.sol"
);
const uniswapV2Erc20Path = path.join(
  process.cwd(),
  "node_modules",
  "@uniswap",
  "v2-core",
  "contracts",
  "UniswapV2ERC20.sol"
);
const localPairInitCodeHash = "4cd0f782c312179bae49ddd831089ab99f671b02266be0ee45cde9e52de14c89";
const uniswapLibPackagePath = path.join(
  process.cwd(),
  "node_modules",
  "@uniswap",
  "lib",
  "package.json"
);

const transferHelperSource = `pragma solidity >=0.6.0;

library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferHelper::safeApprove: approve failed");
    }

    function safeTransfer(address token, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferHelper::safeTransfer: transfer failed");
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferHelper::transferFrom: transferFrom failed");
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value: value}(new bytes(0));
        require(success, "TransferHelper::safeTransferETH: ETH transfer failed");
    }
}
`;

function main() {
  if (!fs.existsSync(uniswapLibPackagePath)) {
    fs.mkdirSync(path.dirname(uniswapLibPackagePath), { recursive: true });
    fs.writeFileSync(
      uniswapLibPackagePath,
      JSON.stringify(
        {
          name: "@uniswap/lib",
          version: "0.0.0-local",
          private: true
        },
        null,
        2
      ) + "\n",
      "utf8"
    );
  }

  if (!fs.existsSync(transferHelperPath)) {
    fs.mkdirSync(path.dirname(transferHelperPath), { recursive: true });
    fs.writeFileSync(transferHelperPath, transferHelperSource, "utf8");
    console.log("Created fallback @uniswap/lib TransferHelper.sol");
  }

  if (fs.existsSync(uniswapLibraryPath)) {
    const source = fs.readFileSync(uniswapLibraryPath, "utf8");
    const nextSource = source.replace(
      /hex'[0-9a-f]{64}'\s*\/\/ init code hash/,
      `hex'${localPairInitCodeHash}' // init code hash`
    );
    if (nextSource !== source) {
      fs.writeFileSync(uniswapLibraryPath, nextSource, "utf8");
      console.log("Patched UniswapV2Library init code hash for local fork");
    }
  }

  if (fs.existsSync(uniswapV2Erc20Path)) {
    const source = fs.readFileSync(uniswapV2Erc20Path, "utf8");
    const nextSource = source
      .replace(
        /string public constant name = '.*';/,
        "string public constant name = 'Wojak Finance V2';"
      )
      .replace(
        /string public constant symbol = '.*';/,
        "string public constant symbol = 'WOJAK-V2';"
      );
    if (nextSource !== source) {
      fs.writeFileSync(uniswapV2Erc20Path, nextSource, "utf8");
      console.log("Patched UniswapV2ERC20 LP metadata to Wojak Finance V2 / WOJAK-V2");
    }
  }
}

main();
