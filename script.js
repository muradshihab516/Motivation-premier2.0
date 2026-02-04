const numberEmojis = {
    '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
    '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
};

function getNumberEmoji(num) {
    return num.toString().split('').map(d => numberEmojis[d] || d).join('');
}

function extractNumber(str) {
    let num = '';
    for (let char of str) {
        if (char >= '0' && char <= '9') {
            num += char;
        }
    }
    return parseInt(num) || 0;
}

function generateLists() {
    const input = document.getElementById('inputList').value.trim();
    
    if (!input) {
        alert('অনুগ্রহ করে লিস্ট পেস্ট করুন!');
        return;
    }

    const lines = input.split('\n');
    
    // Extract date and day
    let date = '';
    let day = '';
    
    for (let line of lines) {
        if (line.includes('তারিখ:')) {
            const match = line.match(/তারিখ:\s*([0-9\-\/\.]+)/);
            if (match) date = match[1];
        }
        if (line.includes('বার:')) {
            const match = line.match(/বার:\s*(\S+)/);
            if (match) day = match[1];
        }
    }

    // Parse entries
    const entries = [];
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // Check if line has number emoji or starts with number
        if (line.match(/[0-9]️⃣/) || line.match(/^[0-9]+[➤➔→]/)) {
            
            let position = extractNumber(line.split('➤')[0] || line.split('@')[0]);
            
            // Get content after arrow
            let content = line;
            const arrowIndex = line.indexOf('➤');
            if (arrowIndex !== -1) {
                content = line.substring(arrowIndex + 1).trim();
            }
            
            const hasCheckmark = content.includes('✅');
            const isNoPost = content.includes('𝙉𝙤 𝙋𝙤𝙨𝙩') || 
                            content.toLowerCase().includes('no post') || 
                            (content.includes('🅾️') && content.length < 30);
            
            let name = content.replace(/✅/g, '').trim();
            
            if (position > 0 || entries.length === 0) {
                entries.push({
                    position: position || entries.length + 1,
                    name: name,
                    hasCheckmark: hasCheckmark,
                    isNoPost: isNoPost
                });
            }
        }
    }

    if (entries.length === 0) {
        alert('কোনো এন্ট্রি পাওয়া যায়নি! সঠিক ফরম্যাটে লিস্ট দিন।');
        return;
    }

    // Generate All Done List
    let doneListText = `📅 তারিখ: ${date}\n📆 বার: ${day}\n\nযারা সাপোর্ট করেছেন\n\n👇👇👇\n\n`;
    
    entries.forEach((entry) => {
        const num = getNumberEmoji(entry.position);
        if (entry.isNoPost) {
            doneListText += `${num}➤#N/A\n`;
        } else if (entry.hasCheckmark) {
            doneListText += `${num}➤${entry.name}\n`;
        } else {
            doneListText += `${num}➤@\n`;
        }
    });

    // Generate Unsupporter List
    const unsupporters = entries.filter(e => !e.hasCheckmark && !e.isNoPost);
    
    let unsupportListText = `🌟 সাপোর্ট লিংক বক্স টিম নোটিশ 🌟\n📅 তারিখ: ${date} (${day})\n\n\n📋 সাপোর্ট বাকি থাকা মেম্বারদের তালিকা:\n\n`;
    
    unsupporters.forEach((entry, index) => {
        const num = getNumberEmoji(index + 1);
        unsupportListText += `${num} ${entry.name} 📌/${entry.position}\n`;
    });

    if (unsupporters.length === 0) {
        unsupportListText += "🎉 সবাই সাপোর্ট করেছে! কেউ বাকি নেই।";
    }

    // Update stats
    const totalMembers = entries.filter(e => !e.isNoPost).length;
    const doneMembers = entries.filter(e => e.hasCheckmark && !e.isNoPost).length;
    const pendingMembers = unsupporters.length;
    const noPostCount = entries.filter(e => e.isNoPost).length;

    document.getElementById('totalCount').textContent = totalMembers;
    document.getElementById('doneCount').textContent = doneMembers;
    document.getElementById('pendingCount').textContent = pendingMembers;
    document.getElementById('nopostCount').textContent = noPostCount;

    // Display results
    document.getElementById('doneList').textContent = doneListText;
    document.getElementById('unsupportList').textContent = unsupportListText;
    
    document.getElementById('outputSection').classList.add('show');
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

function copyDoneList() {
    copyText('doneList', event.target);
}

function copyUnsupportList() {
    copyText('unsupportList', event.target);
}

function copyText(elementId, button) {
    const text = document.getElementById(elementId).textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopied(button);
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopied(button);
    }
}

function showCopied(button) {
    const originalText = button.textContent;
    button.textContent = '✅ কপি হয়েছে!';
    button.style.background = '#333';
    button.style.color = '#fff';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.style.color = '';
    }, 2000);
}