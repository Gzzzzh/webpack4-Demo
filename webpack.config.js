const path = require('path')
const fs = require('fs')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const PurifycssWebpack = require("purifycss-webpack");
//const CopyWebpackPlugin = require("copy-webpack-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
//const glob = require("glob");


const resolve = dir => path.resolve(__dirname, dir);
const pagesDirPath = path.resolve(__dirname, "src/pages");

const getEntries = () => { //自动生成入口对象
    const result = fs.readdirSync(pagesDirPath)
    let entry = {};
    result.forEach(item => {
        entry[item] = path.resolve(__dirname, `./src/pages/${item}/${item}.js`);
    });
    return entry;
}


const generatorHtmlWebpackPlugins = () => { //自动生成html模板
    let arr = [];
    let result = fs.readdirSync(pagesDirPath);
    result.forEach(item => {
        arr.push(new HtmlWebpackPlugin({
            template: `src/pages/${item}/${item}.html`,
            filename: `${item}.html`,
            hash:true,
            chunks: [item, "vendors", "common"]
        }));
    });
    return arr;
}
module.exports = {
    devtool:process.env.NODE_ENV === 'development' ? 'cheap-eval-source-map': 'source-map',
    entry:getEntries(),
    resolve:{
        alias: {
            '@': resolve('src')
        }
    },
    externals : {
        'jquery' : 'window.jQuery'
    },
    output: {
        path:path.join(__dirname, 'dist'),
        filename:'js/[name].[hash:8].js'
    },

    module: {
        rules: [
            {
                test:/\.(c|sc|sa)ss$/,
                use: [
                  process.env.NODE_ENV === 'development' ? 'style-loader': MiniCssExtractPlugin.loader,
                  'css-loader',
                  'sass-loader',
                  
                ]
            },
            //第三方css一般都会考虑到浏览器前缀，所以要对他除外处理，一起处理可能会重复叠加导致打包错误
            {
                test:/\.(c|sc|sa)ss$/,
                exclude:path.resolve(__dirname, 'src/css/lib/themes/default/easyui.css'),
                use: [
                 'postcss-loader'                 
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|bmp)/,
                use: {
                    loader: 'url-loader',
                    options:{
                        limit:5*1024,
                        //指定拷贝文件的输出目录
                        outputPath: 'assets'
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
            /* {
                test: require.resolve('jquery'),
                use: [{
                   loader: 'expose-loader',
                   options: 'jQuery'
                },{
                   loader: 'expose-loader',
                   options: '$'
                }]
            } */
        ]
    },
    // 提取公共模块，包括第三方库和自定义工具库等
     optimization: {
        // 找到chunk中共享的模块,取出来生成单独的chunk
        splitChunks: {
            chunks: "initial",  // async表示抽取异步模块，all表示对所有模块生效，initial表示对同步模块生效
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
        /* runtimeChunk:{
            name:'manifest'
        }, */
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
        new MiniCssExtractPlugin({ //将CSS从js单独分离出来
            filename: "css/[name].[chunkhash:8].css",
            chunkFilename: "css/[name].[chunkhash].css"
        }),
        //对于ui框架自动生成的标签这里无法检测 ，会使一些需要用到的样式 误认为没用到去掉，因此这个插件根据自身需要使用
       // new PurifycssWebpack({ //去除没用的css
            //*.html 表示 src 文件夹下的所有 html 文件，还可以清除其它文件 *.js、*.php···
         //  paths: glob.sync(path.resolve("./src/pages/*/*.html"))
        //}),
        /* new CopyWebpackPlugin([ //静态资源复制
            {
                from:'src/assets',
                to:'assets'
            }
        ])  */
    ],
    devServer: {
        open:true,
        contentBase: './dist',
        host: 'localhost',
        progress: true, //显示打包的进度
        inline: true, //开启页面自动刷新
        port:8080,
         //服务器返回给浏览器的时候是否启用gzip压缩
        compress: true,
        hot:true,
        proxy:{
            '/api': {
                changeOrigin: true,
                secure: false, // 目标服务器地址是否是安全协议
                target: 'https://api.apiopen.top/',
                pathRewrite: {"^/api": ""} // 将/api重写为""空字符串
            }
        }
    },
}