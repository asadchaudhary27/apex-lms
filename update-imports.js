const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Check if the file imports PrismaClient
    if (content.includes('import { PrismaClient } from "@prisma/client";')) {
        content = content.replace('import { PrismaClient } from "@prisma/client";', 'import { prisma } from "@/lib/prisma";');
        changed = true;
    }
    
    // Check if it initializes a new client
    if (content.includes('const prisma = new PrismaClient();')) {
        content = content.replace('const prisma = new PrismaClient();', '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
