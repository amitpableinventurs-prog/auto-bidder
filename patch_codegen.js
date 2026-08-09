const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

function findFiles(dir, filter, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath, filter, callback);
        } else if (file === filter) {
            callback(fullPath);
        }
    }
}

// 1. Patch parser.js
findFiles(path.join(rootDir, 'node_modules'), 'parser.js', (fullPath) => {
    if (!fullPath.includes('typescript')) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    const oldCode = /getTypeAnnotationName\(typeAnnotation\) \{[\s\S]*?return typeAnnotation === null \|\|[\s\S]*?\? void 0[\s\S]*?: _typeAnnotation\$typeN\.name;[\s\S]*?\}/;
    const newCode = `getTypeAnnotationName(typeAnnotation) {
    if (typeAnnotation == null || typeAnnotation.typeName == null) {
      return undefined;
    }
    const typeName = typeAnnotation.typeName;
    if (typeName.type === 'Identifier') {
      return typeName.name;
    }
    if (typeName.type === 'TSQualifiedName' && typeName.right.type === 'Identifier') {
      return typeName.right.name;
    }
    return undefined;
  }`;

    const updated = content.replace(oldCode, newCode);
    if (content !== updated) {
        fs.writeFileSync(fullPath, updated);
        console.log('Patched Parser: ' + fullPath);
    }
});

// 2. Patch componentsUtils.js
findFiles(path.join(rootDir, 'node_modules'), 'componentsUtils.js', (fullPath) => {
    if (!fullPath.includes('typescript')) return;
    let content = fs.readFileSync(fullPath, 'utf8');

    // Allow 'number' as alias for Float
    const updated = content.replace(/case 'TSNumberKeyword':[\s\S]*?throw new Error\([\s\S]*?\);/g,
        "case 'TSNumberKeyword':\n      return {\n        type: 'FloatTypeAnnotation',\n      };");

    if (content !== updated) {
        fs.writeFileSync(fullPath, updated);
        console.log('Patched Utils (Float): ' + fullPath);
    }

    // Fix: A default enum value is required
    const enumErrorRegex = /if \(defaultValue === undefined\) \{[\s\S]*?throw new Error\(`A default enum value is required for "\$\{name\}"`\);[\s\S]*?\}/;
    const enumFix = `if (defaultValue === undefined) {
    const firstType = elementTypes[0];
    if (firstType && firstType.type === 'TSLiteralType' && firstType.literal) {
      defaultValue = firstType.literal.value;
    } else {
      throw new Error(\`A default enum value is required for "\${name}" and no fallback could be determined.\`);
    }
  }`;

    const updatedEnum = updated.replace(enumErrorRegex, enumFix);
    if (updated !== updatedEnum) {
        fs.writeFileSync(fullPath, updatedEnum);
        console.log('Patched Utils (Enum Default): ' + fullPath);
    }
});

// 3. Patch events.js
findFiles(path.join(rootDir, 'node_modules'), 'events.js', (fullPath) => {
    if (!fullPath.includes('typescript')) return;
    let content = fs.readFileSync(fullPath, 'utf8');

    // Support TSNumberKeyword in events (map to Double)
    const oldCode = /case 'TSStringKeyword':[\s\S]*?return emitStringProp\(name, optional\);/;
    const newCode = `case 'TSStringKeyword':
      return emitStringProp(name, optional);
    case 'TSNumberKeyword':
      return emitDoubleProp(name, optional);`;

    const updated = content.replace(oldCode, newCode);
    if (content !== updated) {
        fs.writeFileSync(fullPath, updated);
        console.log('Patched Events: ' + fullPath);
    }
});

console.log('Codegen patching complete');
