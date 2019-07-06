const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurifycssWebpack = require("purifycss-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const glob = require("glob");



const pagesDirPath = path.resolve(__dirname, "./src/js");

const getEntries = () => { //自动生成入口对象
    const result = fs.readdirSync(pagesDirPath)
    let entry = {};
    result.forEach(item => {
        entry[item.slice(0,-3)] = path.resolve(__dirname, `./src/js/${item}`);
    });
    return entry;
}


const generatorHtmlWebpackPlugins = () => { //自动生成html模板
    let arr = [];
    let result = fs.readdirSync(pagesDirPath);
    result.forEach(item => {
        arr.push(new HtmlWebpackPlugin({
            template: `src/${item.slice(0,-3)}.html`,
            filename: `${item.slice(0,-3)}.html`,
            hash:true,
            chunks: [item.slice(0,-3),"manifest", "vendors", "common"]
        }));
    });
    return arr;
}
module.exports = {
    devtool:'eval-source-map',
    entry:getEntries(),
    output: {
        path:path.join(__dirname, 'dist'),
        filename:'js/[name].[hash:8].js'
    },

    module: {
        rules: [
            {
                test:/\.(sa|sc|c)ss$/,
                use: [
                  process.env.NODE_ENV === 'development' ? 'style-loader': MiniCssExtractPlugin.loader,
                  'css-loader',
                  'postcss-loader',
                  'sass-loader',
                  
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|bmp)/,
                use: {
                    loader: 'url-loader',
                    options:{
                        limit:5*1024,
                        //指定拷贝文件的输出目录
                        outputPath: 'images'
                    }
                }
            },
            {
                test: /\.(html|htm)/,
                loader:'html-withimg-loader'
            },
            {
                test:/\.js$/,
                exclude:path.resolve(__dirname, 'node_modules'),
                include:path.resolve(__dirname, 'src'),
                loader:'babel-loader'
            },
            {
                test: require.resolve('jquery'),
                use: [{
                   loader: 'expose-loader',
                   options: 'jQuery'
                },{
                   loader: 'expose-loader',
                   options: '$'
                }]
            }
        ]
    },
    // 提取公共模块，包括第三方库和自定义工具库等
     optimization: {
        // 找到chunk中共享的模块,取出来生成单独的chunk
        splitChunks: {
            chunks: "all",  // async表示抽取异步模块，all表示对所有模块生效，initial表示对同步模块生效
            cacheGroups: {
                vendors: {  // 抽离第三方插件
                    test: /[\\/]node_modules[\\/]/,     // 指定是node_modules下的第三方包
                    name: "vendors",
                    priority: -10                       // 抽取优先级
                },
                utilCommon: {   // 抽离自定义工具库
                    name: "common",
                    minSize: 0,     // 将引用模块分离成新代码文件的最小体积,默认30k
                    minChunks: 2,   // 表示将引用模块如不同文件引用了多少次，才能分离生成新chunk
                    priority: -20
                }
            }
        },
        // 为 webpack 运行时代码创建单独的chunk
        runtimeChunk:{
            name:'manifest'
        },
        //压缩css和js
        minimizer: [
            new UglifyjsWebpackPlugin({
                cache: true, // Boolean/String,字符串即是缓存文件存放的路径
                parallel: true, // 启用多线程并行运行提高编译速度
                sourceMap: true,
                uglifyOptions: {
                output: {
                  comments: false  // 删掉所有注释
                },
                compress: {
                    /* warning: false, // 插件在进行删除一些无用的代码时不提示警告 */
                    drop_console: true // 过滤console,即使写了console,线上也不显示
                }
              } 
           }),
           new OptimizeCSSAssetsPlugin({
            // 默认是全部的CSS都压缩，该字段可以指定某些要处理的文件
            assetNameRegExp: /\.(sa|sc|c)ss$/g, 
            // 指定一个优化css的处理器，默认cssnano
            cssProcessor: require('cssnano'),
           
            cssProcessorPluginOptions: {
              preset: [  'default', {
                  discardComments: { removeAll: true}, //对注释的处理
                  normalizeUnicode: false // 建议false,否则在使用unicode-range的时候会产生乱码
              }]
            },
            canPrint: true  // 是否打印编译过程中的日志
          })
         ]
    },

    plugins: [
        new CleanWebpackPlugin(), //每次运行都清除dist
        ...generatorHtmlWebpackPlugins(),
        /* new HtmlWebpackPlugin({
            template: `src/index.html`,
            filename: `index.html`,
            hash:true,
            chunks: ['index',"manifest", "vendors", "common"]
        }),
        new HtmlWebpackPlugin({
            template: `src/login.html`,
            filename: `login.html`,
            hash:true,
            chunks: ['login',"manifest", "vendors", "common"]
        }),
        new HtmlWebpackPlugin({
            template: `src/demo1.html`,
            filename: `demo1.html`,
            hash:true,
            chunks: ['demo1',"manifest", "vendors", "common"]
        }), */
        new MiniCssExtractPlugin({ //将CSS从js单独分离出来
            filename: "css/[name].[chunkhash:8].css",
            chunkFilename: "css/[name].[chunkhash:8].[id].css"
        }),
        new PurifycssWebpack({ //去除没用的css
            //*.html 表示 src 文件夹下的所有 html 文件，还可以清除其它文件 *.js、*.php···
            paths: glob.sync(path.resolve("./src/*.html"))
        }),
        new CopyWebpackPlugin([ //静态资源复制
            {
                from:'src/assets',
                to:'assets'
            }
        ]) 
    ],
    devServer: {
        open:true,
        contentBase: './dist',
        host: 'localhost',
        port:8080,
         //服务器返回给浏览器的时候是否启用gzip压缩
        compress: true,
        hot:true
    },
}