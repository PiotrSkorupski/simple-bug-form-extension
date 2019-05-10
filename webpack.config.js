module.exports = {
    entry: ['./src/bug.tsx'],
    module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: ['ts-loader']
          },
          {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
          },
          {
            test: /\.woff$/,
            use: [{
                loader: 'base64-inline-loader'
            }]
          }
        ]
    },
    devtool: "source-map",
    externals: [
      /^VSS\/.*/, /^TFS\/.*/, /^q$/
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    output: {
      path: __dirname + '/dist',
      publicPath: '/',
      filename: 'bug.js'
    }
  };