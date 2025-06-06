"use strict";
/**
 * Configuration management for the Enhanced MCP QR Generator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.parseCommandLineArgs = exports.defaultConfig = void 0;
/**
 * Default server configuration
 */
exports.defaultConfig = {
    port: 3000,
    host: 'localhost',
    maxConcurrentRequests: 10,
    defaultErrorCorrectionLevel: 'M',
    defaultFormat: 'png',
    defaultSize: 300,
    defaultMargin: 4,
    defaultColor: '#000000',
    defaultBackgroundColor: '#ffffff',
    maxQRCodeSize: 1000,
    enableLogging: true,
    logLevel: 'info',
    cacheEnabled: true,
    cacheTTL: 3600,
    rateLimiting: {
        enabled: true,
        maxRequests: 100,
        timeWindow: 60 // 1 minute
    },
    allowedDomains: null,
    disallowedDomains: [],
    maxLogoSize: 1024 * 1024 // 1MB
};
/**
 * Parse command line arguments
 * @param args Command line arguments
 * @returns Parsed arguments
 */
function parseCommandLineArgs(args) {
    const result = {};
    result.text = getArgValue(args, '--text');
    result.errorCorrectionLevel = getArgValue(args, '--error-correction-level');
    result.format = getArgValue(args, '--format');
    result.size = parseInt(getArgValue(args, '--size') || '0');
    result.margin = parseInt(getArgValue(args, '--margin') || '0');
    result.color = getArgValue(args, '--color');
    result.backgroundColor = getArgValue(args, '--background-color');
    result.logo = getArgValue(args, '--logo');
    result.logoSize = parseInt(getArgValue(args, '--logo-size') || '0');
    result.output = getArgValue(args, '--output');
    return result;
}
exports.parseCommandLineArgs = parseCommandLineArgs;
/**
 * Get argument value from command line
 * @param args Command line arguments
 * @param argName Argument name
 * @returns Argument value or undefined
 */
function getArgValue(args, argName) {
    const index = args.findIndex(arg => arg.startsWith(argName));
    if (index === -1)
        return undefined;
    const arg = args[index];
    if (arg.includes('=')) {
        return arg.split('=')[1];
    }
    return args[index + 1];
}
/**
 * Load configuration from environment variables or config file
 */
function loadConfig(args) {
    // Start with default config
    const config = { ...exports.defaultConfig };
    // Override with environment variables if present
    if (process.env.PORT)
        config.port = parseInt(process.env.PORT, 10);
    if (process.env.HOST)
        config.host = process.env.HOST;
    if (process.env.MAX_CONCURRENT_REQUESTS)
        config.maxConcurrentRequests = parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10);
    if (process.env.DEFAULT_ERROR_CORRECTION_LEVEL)
        config.defaultErrorCorrectionLevel = process.env.DEFAULT_ERROR_CORRECTION_LEVEL;
    if (process.env.DEFAULT_FORMAT)
        config.defaultFormat = process.env.DEFAULT_FORMAT;
    if (process.env.DEFAULT_SIZE)
        config.defaultSize = parseInt(process.env.DEFAULT_SIZE, 10);
    if (process.env.DEFAULT_MARGIN)
        config.defaultMargin = parseInt(process.env.DEFAULT_MARGIN, 10);
    if (process.env.DEFAULT_COLOR)
        config.defaultColor = process.env.DEFAULT_COLOR;
    if (process.env.DEFAULT_BACKGROUND_COLOR)
        config.defaultBackgroundColor = process.env.DEFAULT_BACKGROUND_COLOR;
    if (process.env.MAX_QR_CODE_SIZE)
        config.maxQRCodeSize = parseInt(process.env.MAX_QR_CODE_SIZE, 10);
    if (process.env.ENABLE_LOGGING)
        config.enableLogging = process.env.ENABLE_LOGGING === 'true';
    if (process.env.LOG_LEVEL)
        config.logLevel = process.env.LOG_LEVEL;
    if (process.env.CACHE_ENABLED)
        config.cacheEnabled = process.env.CACHE_ENABLED === 'true';
    if (process.env.CACHE_TTL)
        config.cacheTTL = parseInt(process.env.CACHE_TTL, 10);
    if (process.env.ALLOWED_DOMAINS)
        config.allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
    if (process.env.DISALLOWED_DOMAINS)
        config.disallowedDomains = process.env.DISALLOWED_DOMAINS.split(',');
    if (process.env.MAX_LOGO_SIZE)
        config.maxLogoSize = parseInt(process.env.MAX_LOGO_SIZE, 10);
    // Override with command line args if present
    if (args) {
        if (args.errorCorrectionLevel)
            config.defaultErrorCorrectionLevel = args.errorCorrectionLevel;
        if (args.format)
            config.defaultFormat = args.format;
        if (args.size)
            config.defaultSize = args.size;
        if (args.margin)
            config.defaultMargin = args.margin;
        if (args.color)
            config.defaultColor = args.color;
        if (args.backgroundColor)
            config.defaultBackgroundColor = args.backgroundColor;
    }
    return config;
}
exports.loadConfig = loadConfig;
//# sourceMappingURL=config.js.map