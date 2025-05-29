// Global variables
let currentStep = 0;
let chatData = {};
let generatedTemplates = null;
let isGenerating = false;

const questions = [
    "¿Cuál es el nombre de tu servidor de Discord?",
    "¿Qué tipo de comunidad es? (Gaming, Social, Roleplay, Creativo, etc.)",
    "¿Qué características únicas o beneficios ofrece tu servidor?",
    "¿Qué tipo de miembros estás buscando?",
    "¿Tienes miembros del staff para mencionar? (opcional)",
    "¿Tienes un banner o enlace especial? (opcional)",
    "¿Alguna información adicional o requisitos especiales? (opcional)"
];

const questionKeys = [
    "serverName",
    "serverType", 
    "features",
    "memberRequirements",
    "staff",
    "banner",
    "additionalInfo"
];

// Navigation functions
function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Chat functions
function startChat() {
    document.getElementById('start-section').classList.add('hidden');
    document.getElementById('chat-interface').classList.remove('hidden');
    
    // Enable input and send button
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    
    // Add first message
    addMessage("¡Hola! Soy tu asistente de IA para plantillas de Discord. Te ayudaré a crear plantillas promocionales increíbles. ¡Empecemos con algunas preguntas!", false);
    
    setTimeout(() => {
        addMessage(questions[0], false);
    }, 1000);
}

function addMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    if (!isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar bot';
        avatar.textContent = '🤖';
        messageDiv.appendChild(avatar);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);
    
    if (isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar user';
        avatar.textContent = '👤';
        messageDiv.appendChild(avatar);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message || isGenerating) return;
    
    // Add user message
    addMessage(message, true);
    
    // Store answer
    const questionKey = questionKeys[currentStep];
    chatData[questionKey] = message;
    
    // Clear input
    input.value = '';
    
    // Move to next question or generate
    currentStep++;
    updateProgress();
    
    setTimeout(() => {
        if (currentStep < questions.length) {
            addMessage(questions[currentStep], false);
        } else {
            // Start generation
            addMessage("¡Perfecto! Tengo toda la información que necesito. Generando tus plantillas ahora...", false);
            disableInput();
            generateTemplates();
        }
    }, 1000);
}

function updateProgress() {
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    
    const progress = ((currentStep + 1) / questions.length) * 100;
    progressText.textContent = `${Math.min(currentStep + 1, questions.length)}/${questions.length} questions`;
    progressFill.style.width = `${progress}%`;
}

function disableInput() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.disabled = true;
    sendBtn.disabled = true;
    document.getElementById('send-icon').textContent = '⏳';
}

// Template generation (simulated AI)
function generateTemplates() {
    isGenerating = true;
    
    // Simulate AI processing time
    setTimeout(() => {
        const templates = createTemplates(chatData);
        generatedTemplates = templates;
        
        addMessage("¡Increíble! He generado tus plantillas. Revísalas a continuación.", false);
        
        setTimeout(() => {
            showResults(templates);
        }, 1000);
        
        isGenerating = false;
    }, 3000);
}

function createTemplates(data) {
    const { serverName, serverType, features, memberRequirements, staff, banner, additionalInfo } = data;
    
    // Formal Template
    const formal = createFormalTemplate(serverName, serverType, features, memberRequirements, staff, banner, additionalInfo);
    
    // Emotional Template
    const emotional = createEmotionalTemplate(serverName, serverType, features, memberRequirements, staff, banner, additionalInfo);
    
    // Epic Template
    const epic = createEpicTemplate(serverName, serverType, features, memberRequirements, staff, banner, additionalInfo);
    
    return {
        formal: {
            content: formal,
            characterCount: formal.length
        },
        emotional: {
            content: emotional,
            characterCount: emotional.length
        },
        epic: {
            content: epic,
            characterCount: epic.length
        }
    };
}

function createFormalTemplate(serverName, serverType, features, memberRequirements, staff, banner, additionalInfo) {
    let template = `╔═══════════════════════════════╗
║          **${serverName}**          ║
╚═══════════════════════════════╝

📋 **INFORMACIÓN DEL SERVIDOR**
• Tipo: ${serverType}
• Características: ${features}

👥 **REQUISITOS DE MIEMBROS**
${memberRequirements}`;

    if (staff) {
        template += `\n\n🔧 **STAFF**\n${staff}`;
    }
    
    if (banner) {
        template += `\n\n🔗 **ENLACE/BANNER**\n${banner}`;
    }
    
    if (additionalInfo) {
        template += `\n\n📌 **INFORMACIÓN ADICIONAL**\n${additionalInfo}`;
    }
    
    template += `\n\n🎯 **¡Únete a nuestra comunidad profesional!**\ndiscord.gg/ejemplo`;
    
    return template;
}

function createEmotionalTemplate(serverName, serverType, features, memberRequirements, staff, banner, additionalInfo) {
    let template = `💖 ═══════════════════════════════ 💖
        ✨ **${serverName}** ✨
💖 ═══════════════════════════════ 💖

🌟 **¡Bienvenido a nuestro hogar!** 🌟

Somos una comunidad ${serverType} llena de amor y amistad donde encontrarás:
💕 ${features}

🤗 **Buscamos personas como tú:**
${memberRequirements}`;

    if (staff) {
        template += `\n\n👑 **Nuestro increíble equipo:**\n❤️ ${staff}`;
    }
    
    if (banner) {
        template += `\n\n🎨 **¡Mira lo que tenemos para ti!**\n🔗 ${banner}`;
    }
    
    if (additionalInfo) {
        template += `\n\n💝 **Algo especial:**\n${additionalInfo}`;
    }
    
    template += `\n\n🏠 **¡Ven y forma parte de nuestra familia!**\n💕 discord.gg/ejemplo 💕\n\n¡Te esperamos con los brazos abiertos! 🤗`;
    
    return template;
}

function createEpicTemplate(serverName, serverType, features, memberRequirements, staff, banner, additionalInfo) {
    let template = `⚔️ ═══════════════════════════════ ⚔️
    🔥 **${serverName.toUpperCase()}** 🔥
⚔️ ═══════════════════════════════ ⚔️

🛡️ **¡PREPÁRATE PARA LA BATALLA!** ⚡

💥 Somos una comunidad ${serverType} ÉPICA que domina:
🔥 ${features}

⚡ **¡RECLUTAMOS GUERREROS!**
🎯 ${memberRequirements}`;

    if (staff) {
        template += `\n\n👑 **NUESTROS LÍDERES SUPREMOS:**\n⚔️ ${staff}`;
    }
    
    if (banner) {
        template += `\n\n🏆 **¡OBSERVA NUESTRO PODER!**\n💥 ${banner}`;
    }
    
    if (additionalInfo) {
        template += `\n\n🌟 **MISIÓN ESPECIAL:**\n🔥 ${additionalInfo}`;
    }
    
    template += `\n\n🚀 **¡ÚNETE A LA LEYENDA!**\n⚔️ discord.gg/ejemplo ⚔️\n\n🔥 ¡EL DESTINO TE ESPERA! 🔥`;
    
    return template;
}

function showResults(templates) {
    document.getElementById('results').classList.remove('hidden');
    
    const templatesGrid = document.getElementById('templates-grid');
    templatesGrid.innerHTML = '';
    
    const templateTypes = [
        { key: 'formal', title: 'Formal Style', icon: '💼', class: 'formal' },
        { key: 'emotional', title: 'Emotional Style', icon: '💖', class: 'emotional' },
        { key: 'epic', title: 'Epic Style', icon: '👑', class: 'epic' }
    ];
    
    templateTypes.forEach(type => {
        const template = templates[type.key];
        const card = createTemplateCard(type, template);
        templatesGrid.appendChild(card);
    });
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }, 100);
}

function createTemplateCard(type, template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    
    const charCount = template.characterCount;
    const charClass = charCount > 2000 ? 'danger' : charCount > 1800 ? 'warning' : 'good';
    const charProgress = Math.min((charCount / 2000) * 100, 100);
    
    card.innerHTML = `
        <div class="template-header">
            <div class="template-title ${type.class}">
                <span>${type.icon}</span>
                <span>${type.title}</span>
            </div>
            <div>
                <div class="char-count ${charClass}">${charCount}/2000</div>
                <div class="char-progress">
                    <div class="char-progress-fill ${charClass}" style="width: ${charProgress}%"></div>
                </div>
            </div>
        </div>
        <div class="template-content">
            <div class="template-preview">${template.content}</div>
            <div class="template-actions">
                <button class="btn-copy ${type.class}" onclick="copyTemplate('${type.key}')">
                    <span>📋</span>
                    <span>Copy</span>
                </button>
                <button class="btn-edit" onclick="editTemplate('${type.key}')">✏️</button>
                <button class="btn-regenerate" onclick="regenerateTemplate('${type.key}')">🔄</button>
            </div>
        </div>
    `;
    
    return card;
}

// Template actions
function copyTemplate(templateKey) {
    const template = generatedTemplates[templateKey];
    
    navigator.clipboard.writeText(template.content).then(() => {
        // Update button to show success
        const button = event.target.closest('.btn-copy');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<span>✅</span><span>Copied!</span>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
        
        // Show toast-like message
        showToast('Template copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy template', 'error');
    });
}

function editTemplate(templateKey) {
    const template = generatedTemplates[templateKey];
    const newContent = prompt('Edit your template:', template.content);
    
    if (newContent !== null) {
        generatedTemplates[templateKey] = {
            content: newContent,
            characterCount: newContent.length
        };
        
        showResults(generatedTemplates);
        showToast('Template updated successfully!');
    }
}

function regenerateTemplate(templateKey) {
    const button = event.target;
    button.disabled = true;
    button.innerHTML = '⏳';
    
    // Simulate regeneration
    setTimeout(() => {
        let newTemplate;
        
        if (templateKey === 'formal') {
            newTemplate = createFormalTemplate(
                chatData.serverName, chatData.serverType, chatData.features,
                chatData.memberRequirements, chatData.staff, chatData.banner, chatData.additionalInfo
            );
        } else if (templateKey === 'emotional') {
            newTemplate = createEmotionalTemplate(
                chatData.serverName, chatData.serverType, chatData.features,
                chatData.memberRequirements, chatData.staff, chatData.banner, chatData.additionalInfo
            );
        } else {
            newTemplate = createEpicTemplate(
                chatData.serverName, chatData.serverType, chatData.features,
                chatData.memberRequirements, chatData.staff, chatData.banner, chatData.additionalInfo
            );
        }
        
        generatedTemplates[templateKey] = {
            content: newTemplate,
            characterCount: newTemplate.length
        };
        
        showResults(generatedTemplates);
        showToast('Template regenerated successfully!');
        
        button.disabled = false;
        button.innerHTML = '🔄';
    }, 2000);
}

function downloadAllTemplates() {
    const { formal, emotional, epic } = generatedTemplates;
    
    const content = `FORMAL TEMPLATE:
${formal.content}

EMOTIONAL TEMPLATE:
${emotional.content}

EPIC TEMPLATE:
${epic.content}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatData.serverName || 'discord'}-templates.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Templates downloaded successfully!');
}

function startOver() {
    // Reset everything
    currentStep = 0;
    chatData = {};
    generatedTemplates = null;
    isGenerating = false;
    
    // Reset UI
    document.getElementById('start-section').classList.remove('hidden');
    document.getElementById('chat-interface').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    
    // Clear chat messages
    document.getElementById('chat-messages').innerHTML = '';
    
    // Reset progress
    document.getElementById('progress-text').textContent = '1/7 questions';
    document.getElementById('progress-fill').style.width = '0%';
    
    // Reset input
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;
    document.getElementById('send-icon').textContent = '📤';
    
    // Scroll to generator
    scrollToGenerator();
    
    showToast('Ready to create a new template!');
}

// Utility functions
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    toast.textContent = message;
    
    // Add slide animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Enter key support for chat input
    const input = document.getElementById('user-input');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

// Add slide out animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(slideOutStyle);