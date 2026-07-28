const fs = require('fs');
const path = require('path');

const fabricDir = path.join(__dirname, 'node_modules', 'react-native-screens', 'src', 'fabric');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
            patchFile(fullPath);
        }
    }
}

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Clean up existing imports
    content = content.replace(/import type {([\s\S]*?)} from 'react-native\/Libraries\/Types\/CodegenTypes';/g, '');
    content = content.replace(/import type { UnsafeMixed } from '.*codegenUtils';/g, '');
    content = content.replace(/import { UnsafeMixed } from '.*codegenUtils';/g, '');
    content = content.replace(/import \* as React from 'react';/g, '');

    // 2. Identify needed types from CodegenTypes
    const codegenTypes = ['Double', 'Int32', 'WithDefault', 'DirectEventHandler', 'BubblingEventHandler', 'UnsafeMixed'];
    let needed = [];
    codegenTypes.forEach(t => {
        if (content.includes(t) && !content.includes(`type ${t}`)) {
            needed.push(t);
        }
    });

    let newImports = '';
    if (needed.length > 0) {
        newImports += `import type { ${needed.join(', ')} } from 'react-native/Libraries/Types/CodegenTypes';\n`;
    }

    if (content.includes('React.ElementRef') || content.includes('React.ComponentRef')) {
        newImports += `import * as React from 'react';\n`;
    }

    if (newImports) {
        if (content.startsWith("'use client';")) {
            content = content.replace("'use client';", `'use client';\n${newImports}`);
        } else {
            content = newImports + content;
        }
    }

    // 3. Normalize usages
    content = content.replace(/CodegenTypes as CT,?/g, '');
    content = content.replace(/CT\./g, '');
    content = content.replace(/React\.ComponentRef/g, 'React.ElementRef');

    // 4. Replace number with appropriate Codegen type
    content = content.replace(/index: number/g, 'index: Int32');
    content = content.replace(/dismissCount: number/g, 'dismissCount: Int32');
    content = content.replace(/progress: number/g, 'progress: Double');
    content = content.replace(/closing: number/g, 'closing: Double');
    content = content.replace(/goingForward: number/g, 'goingForward: Double');
    content = content.replace(/headerHeight: number/g, 'headerHeight: Double');
    content = content.replace(/provenance: number/g, 'provenance: Double');
    content = content.replace(/baseProvenance: number/g, 'baseProvenance: Double');

    content = content.replace(/: number([,;?])/g, ': Double$1');
    content = content.replace(/number\[\]/g, 'Double[]');

    // 5. Fix enums with VALID defaults
    const enums = [
        ['placement', 'SearchBarPlacement', 'automatic'],
        ['placement', 'Placement', 'leading'],
        ['autoCapitalize', 'AutoCapitalizeType', 'none'],
        ['autoCapitalize', 'SearchBarAutoCapitalize', 'none'],
        ['obscureBackground', 'OptionalBoolean', 'undefined'],
        ['hideNavigationBar', 'OptionalBoolean', 'undefined'],
        ['fullScreenSwipeEnabled', 'OptionalBoolean', 'undefined'],
        ['columnType', 'SplitScreenColumnType', 'column'],
        ['preferredDisplayMode', 'SplitViewDisplayMode', 'automatic'],
        ['preferredSplitBehavior', 'SplitViewSplitBehavior', 'automatic'],
        ['primaryEdge', 'SplitViewPrimaryEdge', 'leading'],
        ['orientation', 'SplitViewOrientation', 'inherit'],
        ['orientation', 'Orientation', 'inherit'],
        ['colorScheme', 'SplitViewColorScheme', 'inherit'],
        ['colorScheme', 'TabsHostColorScheme', 'inherit'],
        ['type', 'HeaderSubviewTypes', 'left'],
        ['type', 'StackHeaderTypeAndroid', 'small'],
        ['type', 'StackHeaderSubviewTypeAndroid', 'leading'],
        ['insetType', 'InsetType', 'all'],
        ['iconType', 'IconType', 'image'],
        ['backButtonDisplayMode', 'BackButtonDisplayMode', 'default'],
        ['headerTranslucent', 'boolean', 'false'],
        ['bottomScrollEdgeEffect', 'ScrollEdgeEffect', 'automatic'],
        ['leftScrollEdgeEffect', 'ScrollEdgeEffect', 'automatic'],
        ['rightScrollEdgeEffect', 'ScrollEdgeEffect', 'automatic'],
        ['topScrollEdgeEffect', 'ScrollEdgeEffect', 'automatic'],
        ['stackPresentation', 'StackPresentation', 'push'],
        ['stackAnimation', 'StackAnimation', 'default'],
        ['replaceAnimation', 'ReplaceAnimation', 'pop'],
        ['swipeDirection', 'SwipeDirection', 'horizontal'],
        ['sizing', 'SpacerSize', 'flexible'],
        ['activityMode', 'ActivityMode', 'attached'],
        ['tabBarMinimizeBehavior', 'TabBarMinimizeBehavior', 'automatic'],
        ['tabBarControllerMode', 'TabBarControllerMode', 'automatic'],
        ['layoutDirection', 'LayoutDirection', 'inherit'],
        ['topColumnForCollapsing', 'SplitViewTopColumnForCollapsing', 'default'],
        ['primaryBackgroundStyle', 'SplitViewPrimaryBackgroundStyle', 'default'],
        ['displayModeButtonVisibility', 'SplitViewDisplayModeButtonVisibility', 'automatic'],
        ['blurEffect', 'BlurEffect', 'none'],
        ['userInterfaceStyle', 'UserInterfaceStyle', 'unspecified'],
        ['environment', 'BottomAccessoryEnvironment', 'regular'],
        ['systemItem', 'SystemItem', 'none'],
    ];

    enums.forEach(([prop, type, def]) => {
        const regex = new RegExp(`${prop}\\?: (WithDefault<${type}, '[^']*'>|${type})`, 'g');
        content = content.replace(regex, `${prop}?: WithDefault<${type}, '${def}'>`);
    });

    // 6. Fix problematic command in StackHeaderConfigAndroid
    if (filePath.endsWith('StackHeaderConfigAndroidNativeComponent.ts')) {
        content = content.replace(/options: (UnsafeMixed<[^>]*>|StackHeaderToolbarMenuElementOptionsAndroid\[\])/g, 'options: string');
    }

    // 7. Fix string unions in types ending in 'Event' (not supported by Codegen events)
    const eventTypeRegex = /type\s+(\w+Event)\s*=\s*(?:Readonly<)?{([\s\S]*?)}(?:>)?;/g;
    content = content.replace(eventTypeRegex, (match, name, body) => {
        const newBody = body.replace(/'[^']+'\s*(?:\|\s*'[^']+'\s*)+/g, 'string');
        return `type ${name} = {${newBody}};`;
    });

    // 8. Deduplicate and Clean up imports
    const lines = content.split('\n');
    const seen = new Set();
    const resultLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') {
             resultLines.push('');
             continue;
        }
        if (line.startsWith('import type') || line.startsWith('import {') || line.startsWith('import * as')) {
            if (seen.has(line)) continue;
            seen.add(line);
        }
        resultLines.push(lines[i]);
    }
    content = resultLines.join('\n');

    if (content !== original) {
        console.log(`Patching ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

console.log('Starting comprehensive patch for react-native-screens (v31)...');
walk(fabricDir);
console.log('Patch complete.');
