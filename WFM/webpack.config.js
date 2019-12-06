const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'none',
    entry: {
        'BPDiagram': ['./Scripts/BPDiagram/main.ts']
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [         
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        context: __dirname,
                        configFile: path.resolve(__dirname, 'tsconfig.json')
                    }
                },
                exclude: /node_modules/
            },
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'wwwroot/js/'),
        publicPath: '/js/',
        libraryTarget: 'var', 
        libraryExport: 'default',
        library: 'BPDiagram'
    },
    plugins: [        
        new CleanWebpackPlugin()
    ]
};