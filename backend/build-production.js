const fs = require('fs');
const path = require('path');

// Transform TypeScript to CommonJS JavaScript
function transformFile(content) {
    let jsContent = content;
    
    // Step 1: Remove type annotations
    jsContent = jsContent
        .replace(/:\s*Request[^,)}\n]*/g, '')
        .replace(/:\s*Response[^,)}\n]*/g, '')
        .replace(/:\s*NextFunction[^,)}\n]*/g, '')
        .replace(/:\s*string[^,)}\n]*/g, '')
        .replace(/:\s*number[^,)}\n]*/g, '')
        .replace(/:\s*boolean[^,)}\n]*/g, '')
        .replace(/:\s*any[^,)}\n]*/g, '')
        .replace(/:\s*Promise<[^>]+>[^,)}\n]*/g, '')
        .replace(/:\s*[A-Z][a-zA-Z0-9<>[\],\s|]*[^,)}\n]*/g, '');
    
    // Step 2: Transform imports to requires
    jsContent = jsContent
        .replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"];?\s*/g, 'const { $1 } = require("$2");\n')
        .replace(/import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s*['"]([^'"]+)['"];?\s*/g, 'const $1 = require("$2");\n')
        .replace(/import\s+\*\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s*['"]([^'"]+)['"];?\s*/g, 'const $1 = require("$2");\n')
        .replace(/import\s*['"]([^'"]+)['"];?\s*/g, 'require("$1");\n');
    
    // Step 3: Transform exports
    jsContent = jsContent
        .replace(/export\s+default\s+/g, 'module.exports = ')
        .replace(/export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g, 'const $1 =')
        .replace(/export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, 'function $1')
        .replace(/export\s+async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, 'async function $1')
        .replace(/export\s*\{\s*([^}]+)\s*\};?\s*/g, (match, exports) => {
            return exports.split(',').map(exp => {
                const name = exp.trim();
                return `module.exports.${name} = ${name};`;
            }).join('\n') + '\n';
        });
    
    // Step 4: Add module.exports for functions and consts at the end
    const lines = jsContent.split('\n');
    const exports = [];
    
    for (const line of lines) {
        const funcMatch = line.match(/^(async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        const constMatch = line.match(/^const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
        
        if (funcMatch) {
            exports.push(`module.exports.${funcMatch[2]} = ${funcMatch[2]};`);
        } else if (constMatch && !line.includes('require(')) {
            exports.push(`module.exports.${constMatch[1]} = ${constMatch[1]};`);
        }
    }
    
    if (exports.length > 0) {
        jsContent += '\n\n' + exports.join('\n') + '\n';
    }
    
    return jsContent;
}

// Copy and transform files
function copyFiles(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    
    for (const item of items) {
        const srcPath = path.join(src, item);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            copyFiles(srcPath, path.join(dest, item));
        } else if (item.endsWith('.ts')) {
            const content = fs.readFileSync(srcPath, 'utf8');
            const jsContent = transformFile(content);
            const destPath = path.join(dest, item.replace('.ts', '.js'));
            fs.writeFileSync(destPath, jsContent);
        } else {
            // Copy non-TypeScript files as-is
            const destPath = path.join(dest, item);
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Building production files...');

// Clean dist folder first
if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true, force: true });
}

copyFiles('./src', './dist');
console.log('Production build complete!');