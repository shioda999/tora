//var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: "development",
    cache: true,
    watch: true,
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: "./src/main.ts",
    module: {
    rules: [
        {
          // 拡張子 .ts の場合
            test: /\.ts$/,
          // TypeScript をコンパイルする
            use: "ts-loader"
        }
    ]
    },
    //plugins: [
    //    new HardSourceWebpackPlugin()
    //],
    // import 文で .ts ファイルを解決するため
    resolve: {
        extensions: [".ts", ".js", ".d.ts"]
    },
    watchOptions:{
      poll: true,
    }
};