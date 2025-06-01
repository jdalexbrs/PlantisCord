// Global variables
let currentStep = 0;
let chatData = {};
let generatedTemplates = null;
let isGenerating = false;
let templateConfig = null;

// Dynamic question system
let questions = [];
let questionKeys = [];
let additionalQuestions = [];
let canAskMoreQuestions = true;

function initializeQuestions() {
    questions = [
        "¿Cuál es el nombre de tu servidor?",
        "Selecciona el tipo de comunidad"
    ];
    
    questionKeys = ["serverName", "serverType"];
}

function getQuestionsForServerType(serverType) {
    const serverTypeLower = serverType.toLowerCase();
    
    if (serverTypeLower.includes('clan de minecraft')) {
        return [
            { key: 'gameMode', text: '¿En qué modalidades/versiones están ubicados? (Ej: 1.21 #2, 1.20 #1, Box PvP)' },
            { key: 'features', text: '¿Qué ofrecen a los miembros? (Ej: base grande, granjas OP, sorteos semanales, kits)' },
            { key: 'roles', text: '¿Qué roles reclutan? (Ej: guerreros, builders, farmers, moderadores)' },
            { key: 'alliances', text: '¿Tienen alianzas con otros clanes? (opcional)', optional: true }
        ];
    } else if (serverTypeLower.includes('gaming/entretenimiento')) {
        return [
            { key: 'games', text: '¿Qué juegos principales manejan? (Ej: Valorant, LOL, COD)' },
            { key: 'features', text: '¿Qué actividades gaming ofrecen? (Ej: torneos, ranked teams, eventos)' },
            { key: 'community', text: '¿Qué tipo de ambiente gaming buscan? (Ej: competitivo, casual, pro)' },
            { key: 'platforms', text: '¿En qué plataformas juegan? (opcional)', optional: true }
        ];
    } else if (serverTypeLower.includes('social/anime')) {
        return [
            { key: 'theme', text: '¿Cuál es la temática principal? (Ej: anime específico, manga, otaku general)' },
            { key: 'features', text: '¿Qué actividades sociales ofrecen? (Ej: watch parties, debates, fan art)' },
            { key: 'community', text: '¿Qué tipo de ambiente buscan crear? (Ej: amigable, activo, no tóxico)' },
            { key: 'channels', text: '¿Qué canales especiales tienen? (opcional)', optional: true }
        ];
    } else if (serverTypeLower.includes('roleplay')) {
        return [
            { key: 'rpTheme', text: '¿Cuál es la temática del RP? (Ej: medieval, moderno, fantasía, anime)' },
            { key: 'features', text: '¿Qué elementos de RP ofrecen? (Ej: canales de RP, sistemas, eventos)' },
            { key: 'roles', text: '¿Qué roles pueden interpretar los usuarios?' },
            { key: 'rules', text: '¿Tienen reglas especiales para el RP? (opcional)', optional: true }
        ];
    } else {
        // General/Other
        return [
            { key: 'theme', text: '¿Cuál es la temática principal de tu servidor?' },
            { key: 'features', text: '¿Qué actividades y características principales ofrecen?' },
            { key: 'community', text: '¿Qué tipo de ambiente buscan crear?' },
            { key: 'special', text: '¿Algo especial que los distinga? (opcional)', optional: true }
        ];
    }
}

const commonOptionalQuestions = [
    { key: 'staff', text: 'Staff principal con sus roles (formato: ID-Rol, ej: 1234567890123456789-Owner, 9876543210987654321-Manager) (opcional)', optional: true },
    { key: 'banner', text: 'Link del banner/imagen del servidor (opcional)', optional: true },
    { key: 'serverLink', text: 'Link de invitación del servidor (Ej: discord.gg/ejemplo)', optional: false },
    { key: 'additionalInfo', text: 'Información adicional que quieras destacar (opcional)', optional: true }
];

const optionalQuestions = ["staff", "banner", "additionalInfo"];

// Navigation functions
function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Load template configuration and training data
async function loadTemplateConfig() {
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout loading files')), 10000)
        );
        
        const [configResponse, trainingResponse] = await Promise.race([
            Promise.all([
                fetch('templates.json'),
                fetch('training-data.json')
            ]),
            timeoutPromise
        ]);
        
        if (!configResponse.ok || !trainingResponse.ok) {
            throw new Error(`Failed to load configuration files: ${configResponse.status}, ${trainingResponse.status}`);
        }
        
        templateConfig = await configResponse.json();
        const trainingData = await trainingResponse.json();
        
        // Merge training data with config
        templateConfig.patterns = trainingData.patterns;
        templateConfig.phrases = trainingData.phrases;
        templateConfig.trainingTemplates = trainingData.templates;
        
    } catch (error) {
        console.error('Error loading configuration:', error);
        
        // Show user-friendly error
        if (document.getElementById('chat-interface') && !document.getElementById('chat-interface').classList.contains('hidden')) {
            addMessage("⚠️ Error cargando configuración. Usando configuración por defecto.", false);
        }
        
        // Fallback to default config if files not found
        templateConfig = getDefaultConfig();
    }
}

function getDefaultConfig() {
    return {
        formal: {
            name: "Formal Style",
            icon: "💼",
            class: "formal"
        },
        emotional: {
            name: "Emotional Style", 
            icon: "💖",
            class: "emotional"
        },
        epic: {
            name: "Epic Style",
            icon: "👑", 
            class: "epic"
        },
        patterns: {
            decorativeElements: [
                "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                "═══════════════════════════════",
                "╔═══════════════════════════════╗"
            ],
            titles: [
                "⚔️ 『{serverName}』 ⚔️",
                "🔥 **{serverName}** 🔥",
                "✨ **{serverName}** ✨"
            ],
            sectionHeaders: {
                offers: [
                    "✠ ¿Qué ofrecemos? ✠",
                    "🎯 **¿Qué ofrecemos?**",
                    "⚜️ **Ofrecemos:**"
                ],
                requirements: [
                    "✦ ¿Qué buscamos? ✦",
                    "🔱 **Buscamos:**",
                    "✅ **Requisitos:**"
                ]
            }
        },
        phrases: {
            welcomeMessages: [
                "Somos una gran comunidad llamada {serverName} donde todos la pasan muy bien",
                "¿Has estado buscando un clan maravilloso respetuoso?",
                "El clan {serverName} está abierto para todos los usuarios"
            ],
            callToAction: [
                "¡Qué esperas? ¡Únete ya!",
                "🔥 ¡EL DESTINO TE ESPERA! 🔥",
                "¡Únete y sé parte de nosotros!"
            ]
        },
        responses: {
            serverName: {
                filters: ["el nombre de mi servidor es", "se llama", "mi servidor", "nuestro servidor"],
                cleanPatterns: ["^(el nombre de mi servidor es|se llama|mi servidor|nuestro servidor)\\s*", "^(es|se llama)\\s*", "\"", "'"]
            },
            serverType: {
                filters: ["es una comunidad", "somos", "es un servidor de", "tipo"],
                cleanPatterns: ["^(es una comunidad|somos|es un servidor de|tipo)\\s*", "^(de|del|la)\\s*"]
            }
        },
        skipMessages: {
            staff: "Perfecto, continuaremos sin mencionar staff específico.",
            banner: "Entendido, crearemos la plantilla sin banner.",
            additionalInfo: "Muy bien, tenemos toda la información necesaria."
        }
    };
}

// Chat functions
async function startChat() {
    document.getElementById('start-section').classList.add('hidden');
    document.getElementById('chat-interface').classList.remove('hidden');
    
    // Load configuration if not already loaded
    if (!templateConfig) {
        await loadTemplateConfig();
    }
    
    // Enable input and send button
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    
    // Add enter key listener
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Initialize the dynamic question system
    initializeQuestions();
    currentStep = 0;
    chatData = {};
    canAskMoreQuestions = true;
    
    // Add first message
    addMessage("¡Hola! Soy tu asistente de IA para plantillas de Discord. Te haré preguntas específicas según tu tipo de servidor para crear plantillas auténticas.", false);
    
    setTimeout(() => {
        addMessage(questions[0], false);
        updateProgress();
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
    
    // Smooth scroll to bottom with animation
    requestAnimationFrame(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    });
}

function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (isGenerating) return;
    
    // Handle conversation continuation after all questions
    if (currentStep >= questions.length) {
        if (message.toLowerCase().includes('generar') || message.toLowerCase().includes('plantillas')) {
            addMessage(message, true);
            addMessage("¡Perfecto! Generando tus 5 plantillas personalizadas ahora...", false);
            disableInput();
            generateTemplates();
            return;
        } else if (generatedTemplates) {
            // Handle post-generation conversation and modifications
            processTemplateModification(message);
            return;
        } else {
            // Continue conversation and update templates in real-time
            addMessage(message, true);
            // Process additional info
            chatData.additionalConversation = (chatData.additionalConversation || '') + ' ' + message;
            addMessage("Información agregada. Escribe 'generar' cuando quieras crear las plantillas, o continúa agregando detalles.", false);
            // Generate updated templates in background
            updateTemplatesInRealTime();
            return;
        }
    }
    
    const questionKey = questionKeys[currentStep];
    
    // Check if current question is optional based on question text or key
    const currentQuestion = questions[currentStep];
    const isOptionalQuestion = currentQuestion && (
        currentQuestion.includes('(opcional)') || 
        optionalQuestions.includes(questionKey) ||
        questionKey === 'alliances' ||
        questionKey === 'staff' ||
        questionKey === 'banner' ||
        questionKey === 'additionalInfo' ||
        questionKey === 'platforms' ||
        questionKey === 'channels' ||
        questionKey === 'rules' ||
        questionKey === 'special'
    );
    
    // Allow empty messages for optional questions
    if (!message && !isOptionalQuestion) {
        return;
    }
    
    // Handle optional questions
    if (!message && isOptionalQuestion) {
        addMessage("(omitido)", true);
        addMessage(templateConfig?.skipMessages[questionKey] || "Continuando...", false);
        chatData[questionKey] = null;
    } else {
        // Add user message
        addMessage(message, true);
        
        // Clean and filter the response
        const cleanedMessage = cleanUserResponse(message, questionKey);
        chatData[questionKey] = cleanedMessage;
    }
    
    // Clear input
    input.value = '';
    
    // Dynamic question expansion after server type
    if (currentStep === 1 && chatData.serverType) {
        const typeQuestions = getQuestionsForServerType(chatData.serverType);
        typeQuestions.forEach(q => {
            questions.push(q.text);
            questionKeys.push(q.key);
        });
        // Add common optional questions
        commonOptionalQuestions.forEach(q => {
            questions.push(q.text);
            questionKeys.push(q.key);
        });
    }
    
    // Move to next question or continue conversation
    currentStep++;
    updateProgress();
    
    setTimeout(() => {
        if (currentStep < questions.length) {
            if (currentStep === 1) {
                // Show dropdown for server type selection
                addServerTypeDropdown();
            } else {
                addMessage(questions[currentStep], false);
            }
        } else {
            // Continue conversation instead of generating immediately
            addMessage("¿Te gustaría agregar más detalles específicos o generar las plantillas ahora? (escribe 'generar' para crear las plantillas o continúa agregando información)", false);
            canAskMoreQuestions = true;
        }
    }, 1000);
}

// Clean user responses using AI-like filtering
function cleanUserResponse(message, questionKey) {
    if (!templateConfig || !templateConfig.responses || !templateConfig.responses[questionKey]) {
        // Special handling for staff IDs
        if (questionKey === 'staff') {
            return formatStaffIds(message);
        }
        return message;
    }
    
    const config = templateConfig.responses[questionKey];
    let cleaned = message.toLowerCase();
    
    // Apply clean patterns
    config.cleanPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        cleaned = cleaned.replace(regex, '');
    });
    
    // Trim and capitalize first letter
    cleaned = cleaned.trim();
    if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    // Remove quotes
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    
    // Special handling for staff IDs
    if (questionKey === 'staff') {
        return formatStaffIds(cleaned || message);
    }
    
    return cleaned || message;
}

function formatStaffIds(input) {
    if (!input) return input;
    
    // Check if input contains ID-Role format
    const staffEntries = input.split(',').map(entry => entry.trim());
    const formattedStaff = [];
    
    staffEntries.forEach(entry => {
        // Pattern for ID-Role format (1234567890123456789-Owner)
        const idRolePattern = /(\d{17,19})\s*[-]\s*(.+)/;
        const match = entry.match(idRolePattern);
        
        if (match) {
            const id = match[1];
            const role = match[2].trim();
            formattedStaff.push(`<@${id}> - ${role}`);
        } else {
            // Try to extract just numeric ID
            const idPattern = /\b\d{17,19}\b/;
            const idMatch = entry.match(idPattern);
            if (idMatch) {
                formattedStaff.push(`<@${idMatch[0]}>`);
            } else {
                // Keep original if no ID pattern found
                formattedStaff.push(entry);
            }
        }
    });
    
    return formattedStaff.length > 0 ? formattedStaff.join('\n') : input;
}

function addServerTypeDropdown() {
    const messagesContainer = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar bot';
    avatar.textContent = '🤖';
    messageDiv.appendChild(avatar);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const selectElement = document.createElement('select');
    selectElement.id = 'server-type-select';
    selectElement.style.width = '100%';
    selectElement.style.padding = '8px';
    selectElement.style.backgroundColor = '#36393f';
    selectElement.style.color = 'white';
    selectElement.style.border = '1px solid #5865f2';
    selectElement.style.borderRadius = '4px';
    selectElement.style.marginTop = '8px';
    
    const options = [
        { value: '', text: 'Selecciona el tipo de servidor...' },
        { value: 'Clan de Minecraft', text: 'Clan de Minecraft' },
        { value: 'Gaming/Entretenimiento', text: 'Gaming/Entretenimiento' },
        { value: 'Social/Anime', text: 'Social/Anime' },
        { value: 'Roleplay', text: 'Roleplay' },
        { value: 'General', text: 'General/Otro' }
    ];
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        selectElement.appendChild(optionElement);
    });
    
    selectElement.addEventListener('change', function() {
        if (this.value) {
            chatData.serverType = this.value;
            addMessage(this.value, true);
            
            // Expand questions based on selection
            const typeQuestions = getQuestionsForServerType(this.value);
            typeQuestions.forEach(q => {
                questions.push(q.text);
                questionKeys.push(q.key);
            });
            commonOptionalQuestions.forEach(q => {
                questions.push(q.text);
                questionKeys.push(q.key);
            });
            
            currentStep++;
            updateProgress();
            
            setTimeout(() => {
                if (currentStep < questions.length) {
                    addMessage(questions[currentStep], false);
                }
            }, 500);
        }
    });
    
    // Add timeout for users who don't select anything
    setTimeout(() => {
        if (!chatData.serverType) {
            chatData.serverType = 'General';
            addMessage('General/Otro (selección automática)', true);
            
            const typeQuestions = getQuestionsForServerType('General');
            typeQuestions.forEach(q => {
                questions.push(q.text);
                questionKeys.push(q.key);
            });
            commonOptionalQuestions.forEach(q => {
                questions.push(q.text);
                questionKeys.push(q.key);
            });
            
            currentStep++;
            updateProgress();
            
            setTimeout(() => {
                if (currentStep < questions.length) {
                    addMessage(questions[currentStep], false);
                }
            }, 500);
        }
    }, 30000); // 30 seconds timeout
    
    contentDiv.innerHTML = 'Selecciona el tipo de comunidad:';
    contentDiv.appendChild(selectElement);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateTemplatesInRealTime() {
    // Generate templates in background without showing them
    try {
        const templates = createTemplates(chatData);
        generatedTemplates = templates;
        console.log('Templates updated in real-time:', templates);
    } catch (error) {
        console.error('Error updating templates:', error);
    }
}

function updateProgress() {
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    
    // Use a minimum expected number of questions for better UX
    const expectedQuestions = Math.max(questions.length, 7); // At least 7 questions expected
    const progress = (currentStep / expectedQuestions) * 100;
    const displayedTotal = currentStep > questions.length ? currentStep : questions.length;
    
    progressText.textContent = `${currentStep}/${displayedTotal} preguntas`;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
}

function disableInput() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.disabled = true;
    sendBtn.disabled = true;
    document.getElementById('send-icon').textContent = '⏳';
}

function enableInput() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.disabled = false;
    sendBtn.disabled = false;
    document.getElementById('send-icon').textContent = '📤';
    
    // Restore focus with slight delay to ensure it works
    setTimeout(() => {
        if (input && !input.disabled) {
            input.focus();
        }
    }, 100);
}

// Template generation
function generateTemplates() {
    isGenerating = true;
    
    try {
        // Add loading message with spinner
        addMessage("🔄 Generando tus 5 plantillas personalizadas...", false);
        
        // Add loading indicator to chat
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-state';
        loadingDiv.id = 'template-loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div><span>Procesando con IA...</span>';
        document.getElementById('chat-messages').appendChild(loadingDiv);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        
        // Simulate AI processing time
        setTimeout(() => {
            // Remove loading indicator
            const loadingElement = document.getElementById('template-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            const templates = createTemplates(chatData);
            generatedTemplates = templates;
            
            console.log('Templates generated:', templates); // Debug log
            
            addMessage("✅ ¡Increíble! He generado 5 plantillas únicas para ti. Revísalas a continuación.", false);
            
            setTimeout(() => {
                showResults(templates);
                // Enable conversation after showing results
                enableContinuousChat();
            }, 1000);
            
            isGenerating = false;
        }, 2000);
    } catch (error) {
        console.error('Error generating templates:', error);
        
        // Remove loading indicator
        const loadingElement = document.getElementById('template-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        addMessage("❌ Hubo un error generando las plantillas. Por favor intenta de nuevo.", false);
        enableInput();
        isGenerating = false;
    }
}

function createTemplates(data) {
    console.log('Creating templates with data:', data); // Debug log
    
    const templates = {};
    
    // Ensure we have minimum required data
    if (!data.serverName) {
        data.serverName = "Mi Servidor";
    }
    if (!data.serverType) {
        data.serverType = "Gaming";
    }
    
    // Generate each template type - now 5 templates
    const templateTypes = ['formal', 'emotional', 'epic', 'friendly', 'professional'];
    
    templateTypes.forEach(type => {
        try {
            const template = buildTemplateFromConfig(data, type);
            // Calculate accurate character count for Discord
            const actualCharCount = template.replace(/\r\n/g, '\n').length;
            templates[type] = {
                content: template,
                characterCount: actualCharCount,
                name: getTemplateName(type),
                icon: getTemplateIcon(type)
            };
            console.log(`Generated ${type} template:`, templates[type]); // Debug log
        } catch (error) {
            console.error(`Error generating ${type} template:`, error);
            // Fallback template
            templates[type] = {
                content: `**${data.serverName}**\n\nSomos una comunidad ${data.serverType} increíble.\n\n¡Únete a nosotros!`,
                characterCount: 50,
                name: getTemplateName(type),
                icon: getTemplateIcon(type)
            };
        }
    });
    
    return templates;
}

function getTemplateName(type) {
    const names = {
        formal: "Estilo Formal",
        emotional: "Estilo Emocional", 
        epic: "Estilo Épico",
        friendly: "Estilo Amigable",
        professional: "Estilo Profesional"
    };
    return names[type] || type;
}

function getTemplateIcon(type) {
    const icons = {
        formal: "💼",
        emotional: "💖",
        epic: "👑",
        friendly: "😊",
        professional: "🎯"
    };
    return icons[type] || "📝";
}

function buildTemplateFromConfig(data, type) {
    return generateAuthenticTemplate(data, type);
}

function generateAuthenticTemplate(data, templateType) {
    // Ensure templateConfig is available
    if (!templateConfig || !templateConfig.patterns) {
        console.warn('Template config not loaded, using defaults');
        templateConfig = getDefaultConfig();
    }
    
    const patterns = templateConfig.patterns || {};
    const phrases = templateConfig.phrases || {};
    
    // Safely get random element
    const getRandomElement = (array, fallback = '') => {
        if (!array || !Array.isArray(array) || array.length === 0) {
            return fallback;
        }
        return array[Math.floor(Math.random() * array.length)];
    };
    
    // Helper function to generate authentic Minecraft features
    const generateMinecraftFeatures = (userFeatures) => {
        const minecraftElements = patterns.minecraftElements || [];
        const userItems = userFeatures ? userFeatures.split(',').map(item => item.trim()) : [];
        
        // Combine user features with random Minecraft elements
        const combinedFeatures = [...userItems];
        
        // Add 2-3 random Minecraft-specific elements
        for (let i = 0; i < 3 && i < minecraftElements.length; i++) {
            const randomElement = getRandomElement(minecraftElements);
            if (!combinedFeatures.some(item => item.toLowerCase().includes(randomElement.toLowerCase().split(' ')[0]))) {
                combinedFeatures.push(randomElement);
            }
        }
        
        return combinedFeatures;
    };
    
    // Helper function to generate requirements list
    const generateRequirementsList = (data) => {
        const serverTypeLower = data.serverType ? data.serverType.toLowerCase() : '';
        const userRequirements = data.community || data.requirements || '';
        const userItems = userRequirements ? userRequirements.split(',').map(item => item.trim()) : [];
        
        let essentialRequirements = [];
        
        if (serverTypeLower.includes('clan de minecraft')) {
            essentialRequirements = [
                "No estar en otro clan",
                "Ser activo en NauticMC", 
                "No ser tóxico"
            ];
        } else if (serverTypeLower.includes('gaming')) {
            essentialRequirements = [
                "Ser activo en Discord",
                "Tener micrófono decente",
                "No ser tóxico"
            ];
        } else if (serverTypeLower.includes('social') || serverTypeLower.includes('anime')) {
            essentialRequirements = [
                "Ser respetuoso",
                "Participar en conversaciones",
                "No spam"
            ];
        } else if (serverTypeLower.includes('roleplay')) {
            essentialRequirements = [
                "Conocer las reglas de RP",
                "Ser creativo",
                "Respetar el lore"
            ];
        } else {
            essentialRequirements = [
                "Ser activo",
                "Respetar las normas",
                "No ser tóxico"
            ];
        }
        
        // Combine with user requirements
        return [...essentialRequirements, ...userItems].slice(0, 6);
    };
    
    // Helper function to generate features list
    const generateFeaturesList = (data) => {
        const serverTypeLower = data.serverType ? data.serverType.toLowerCase() : '';
        const userFeatures = data.features || data.theme || '';
        const userItems = userFeatures ? userFeatures.split(',').map(item => item.trim()) : [];
        
        let defaultFeatures = [];
        
        if (serverTypeLower.includes('clan de minecraft')) {
            return generateMinecraftFeatures(userFeatures);
        } else if (serverTypeLower.includes('gaming')) {
            defaultFeatures = [
                "Torneos regulares",
                "Canales de voz especializados",
                "Sistema de ranking"
            ];
        } else if (serverTypeLower.includes('social') || serverTypeLower.includes('anime')) {
            defaultFeatures = [
                "Canales temáticos",
                "Eventos sociales",
                "Sistema de roles"
            ];
        } else if (serverTypeLower.includes('roleplay')) {
            defaultFeatures = [
                "Canales de RP temáticos",
                "Sistema de personajes",
                "Eventos de RP"
            ];
        } else {
            defaultFeatures = [
                "Comunidad activa",
                "Eventos regulares",
                "Canales organizados"
            ];
        }
        
        const combinedFeatures = [...userItems];
        
        // Add default features if we have room
        for (let i = 0; i < 3 && i < defaultFeatures.length; i++) {
            if (!combinedFeatures.some(item => item.toLowerCase().includes(defaultFeatures[i].toLowerCase().split(' ')[0]))) {
                combinedFeatures.push(defaultFeatures[i]);
            }
        }
        
        return combinedFeatures;
    };
    
    let template = '';
    
    if (templateType === 'formal') {
        // Formal template structure with authentic Minecraft clan styling
        const decorativeLine = getRandomElement(patterns.decorativeElements) || "═══════════════════════════════";
        const titleStyle = (getRandomElement(patterns.titles) || "⚔️ {serverName} ⚔️").replace('{serverName}', data.serverName);
        
        template += `${decorativeLine}\n`;
        template += `${titleStyle}\n`;
        template += `${decorativeLine}\n\n`;
        
        // Welcome section with authentic clan messaging
        const welcomeMsg = (getRandomElement(phrases.welcomeMessages) || "Somos una gran comunidad llamada {serverName} donde todos la pasan muy bien").replace('{serverName}', data.serverName);
        template += `${welcomeMsg}\n\n`;
        
        // Location section (very important for Minecraft clans)
        const locationHeader = getRandomElement(patterns.sectionHeaders?.location) || "🌍 **Estamos en:**";
        template += `${locationHeader}\n`;
        if (data.gameMode) {
            template += `${data.gameMode}\n\n`;
        } else {
            // Default NauticMC locations
            template += `1.21 #1\n1.21 #2\n\n`;
        }
        
        // Offers section with Minecraft-specific features
        const offersHeader = getRandomElement(patterns.sectionHeaders?.offers) || "🎉 **LO QUE OFRECEMOS** 🎉";
        template += `${offersHeader}\n`;
        
        const features = generateMinecraftFeatures(data.features || data.theme || data.gameMode);
        features.forEach((feature, index) => {
            const icon = index % 3 === 0 ? '💎' : index % 3 === 1 ? '🏠' : '⚙️';
            template += `${icon} **⇒ ${feature}**\n`;
        });
        template += '\n';
        
        // Requirements section with authentic clan needs
        const reqHeader = getRandomElement(patterns.sectionHeaders?.requirements) || "📜 **BUSCAMOS NUEVOS MIEMBROS** 📜";
        template += `${reqHeader}\n`;
        
        // Generate role requirements
        const roles = data.roles || data.community || "Guerreros, Farmers, Builders";
        const roleList = roles.split(',').map(role => role.trim());
        roleList.forEach(role => {
            const icon = role.toLowerCase().includes('guerr') ? '⚔️' : 
                        role.toLowerCase().includes('farm') ? '🧑‍🌾' : 
                        role.toLowerCase().includes('build') ? '🏗️' : '⭐';
            template += `${icon} **⇒ ${role}**\n`;
        });
        template += '\n';
        
        // Basic requirements
        template += `📋 **REQUISITOS BÁSICOS**\n`;
        const requirements = generateRequirementsList(data.community);
        requirements.forEach(req => {
            template += `✅ ${req}\n`;
        });
        template += '\n';
        
        // Alliances section (very common in Minecraft clans)
        if (data.alliances) {
            const allianceHeader = getRandomElement(patterns.sectionHeaders?.alliances) || "🤝 **ALIANZAS**";
            template += `${allianceHeader}\n`;
            const alliances = data.alliances.split(',').map(ally => ally.trim());
            alliances.forEach(ally => {
                template += `⚔️ ${ally}\n`;
            });
            template += '\n';
        }
        
        // Leaders section
        if (data.staff) {
            const staffHeader = getRandomElement(patterns.sectionHeaders?.leaders) || "👑 **FUNDADORES DEL CLAN** 👑";
            template += `${staffHeader}\n`;
            template += `${data.staff}\n\n`;
        }
        
        // Call to action with Discord link
        const callToAction = getRandomElement(phrases.callToAction) || "¡Qué esperas? ¡Únete ya!";
        template += `🚀 ${callToAction}\n`;
        const serverLink = data.serverLink || "https://discord.gg/ejemplo";
        template += `🔗 **Discord:** ${serverLink}`;
        
    } else if (templateType === 'emotional') {
        // Emotional template with clan family vibes
        template += `💖 ═══════════════════════════════ 💖\n`;
        template += `        ✨ **${data.serverName}** ✨\n`;
        template += `💖 ═══════════════════════════════ 💖\n\n`;
        
        template += `🌟 **¡Bienvenido a nuestro hogar digital!** 🌟\n\n`;
        
        const welcomeMsg = (getRandomElement(phrases.welcomeMessages) || "Somos una gran comunidad donde todos la pasan muy bien").replace('{serverName}', data.serverName);
        template += `${welcomeMsg}\n\n`;
        
        // Location with emotional touch
        template += `🏠 **Nuestro hogar en NauticMC:**\n`;
        if (data.gameMode) {
            template += `💕 ${data.gameMode}\n\n`;
        } else {
            template += `💕 1.21 #1 y #2 (¡donde nacen las amistades!)\n\n`;
        }
        
        template += `🎁 **En nuestra familia encontrarás:**\n`;
        const features = generateMinecraftFeatures(data.features || data.theme);
        features.forEach(feature => {
            template += `💝 ${feature} - Te hará sentir parte de algo especial\n`;
        });
        template += '\n';
        
        template += `🤗 **Buscamos personas como tú:**\n`;
        const roles = data.roles || "Guerreros, Farmers, Builders";
        const roleList = roles.split(',').map(role => role.trim());
        roleList.forEach(role => {
            template += `❤️ ${role} - Cada miembro es valioso para nosotros\n`;
        });
        template += '\n';
        
        if (data.staff) {
            template += `👑 **Nuestra querida familia de líderes:**\n`;
            template += `💕 ${data.staff}\n`;
            template += `Son personas increíbles que dedican su corazón para hacer de este lugar nuestro hogar.\n\n`;
        }
        
        const emotionalCall = getRandomElement(phrases.callToAction) || "¡Te esperamos con los brazos abiertos!";
        template += `🏠 ${emotionalCall}\n`;
        const serverLink = data.serverLink || "discord.gg/ejemplo";
        template += `💌 **Tu nuevo hogar te espera:** ${serverLink}`;
        
    } else if (templateType === 'epic') {
        // Epic template with legendary clan power
        template += `⚔️ ═══════════════════════════════ ⚔️\n`;
        template += `    🔥 **${data.serverName}** 🔥\n`;
        template += `⚔️ ═══════════════════════════════ ⚔️\n\n`;
        
        template += `🛡️ **¡PREPÁRATE PARA LA BATALLA DEFINITIVA!** ⚡\n\n`;
        
        // Epic clan description
        const epicPhrase = getRandomElement(phrases.epicPhrases) || "De las sombras a la gloria";
        template += `⚡ **${epicPhrase.toUpperCase()}:**\n`;
        template += `Desde las profundidades de NauticMC hasta las alturas más épicas, hemos forjado un IMPERIO que trasciende todas las expectativas. No somos simplemente un clan, somos una FUERZA IMPARABLE que domina cada modalidad.\n\n`;
        
        // Epic location
        template += `🌍 **DOMINIOS DE PODER:**\n`;
        if (data.gameMode) {
            template += `⚡ ${data.gameMode} - TERRITORIO BAJO NUESTRO CONTROL\n\n`;
        } else {
            template += `⚡ 1.21 #1, #2, #3 - DOMINAMOS MÚLTIPLES DIMENSIONES\n\n`;
        }
        
        template += `💥 **ARSENAL ÉPICO QUE CONTROLAMOS:**\n`;
        const features = generateMinecraftFeatures(data.features || data.theme);
        features.forEach(feature => {
            template += `🔥 ${feature} - PODER QUE DESTROZA A LA COMPETENCIA\n`;
        });
        template += '\n';
        
        template += `⚡ **¡RECLUTAMOS SOLO A LOS MÁS LEGENDARIOS!**\n`;
        template += `Solo aquellos dignos de portar nuestros colores pueden unirse a nuestras filas:\n`;
        const roles = data.roles || "Guerreros, Farmers, Builders";
        const roleList = roles.split(',').map(role => role.trim());
        roleList.forEach(role => {
            template += `⚔️ ${role} - MAESTROS DE SU ARTE\n`;
        });
        template += '\n';
        
        if (data.alliances) {
            template += `🤝 **ALIANZAS DE GUERRA ETERNA:**\n`;
            const alliances = data.alliances.split(',').map(ally => ally.trim());
            alliances.forEach(ally => {
                template += `🔥 ${ally} - HERMANOS EN BATALLA\n`;
            });
            template += '\n';
        }
        
        if (data.staff) {
            template += `👑 **NUESTROS EMPERADORES SUPREMOS:**\n`;
            template += `⚔️ ${data.staff}\n`;
            template += `Guerreros legendarios que han conquistado incontables batallas y guían nuestro imperio hacia la gloria eterna.\n\n`;
        }
        
        const epicCall = getRandomElement(phrases.callToAction) || "¡EL DESTINO TE ESPERA!";
        template += `🚀 **${epicCall.toUpperCase()}**\n`;
        template += `El destino ha conspirado para traerte hasta aquí. Las estrellas se han alineado y los dioses de NauticMC han susurrado tu nombre.\n\n`;
        
        const serverLink = data.serverLink || "discord.gg/ejemplo";
        template += `⚔️ **EL PORTAL AL PODER ABSOLUTO:** ${serverLink} ⚔️`;
        
    } else if (templateType === 'friendly') {
        // Friendly template with casual, welcoming tone
        template += `🌈 ══════════════════════════════ 🌈\n`;
        template += `    😊 **${data.serverName}** 😊\n`;
        template += `🌈 ══════════════════════════════ 🌈\n\n`;
        
        template += `👋 **¡Hola! ¿Buscas un lugar genial para jugar?** 🎮\n\n`;
        
        const friendlyWelcome = `¡Has llegado al lugar perfecto! En ${data.serverName} somos como una gran familia donde todos nos llevamos súper bien y nos ayudamos mutuamente.`;
        template += `${friendlyWelcome}\n\n`;
        
        // Location with friendly approach
        template += `🏡 **Nuestro rinconcito en NauticMC:**\n`;
        if (data.gameMode) {
            template += `🎯 ${data.gameMode} (¡ahí nos la pasamos genial!)\n\n`;
        } else {
            template += `🎯 1.21 #1 y #2 (¡súper divertido!)\n\n`;
        }
        
        template += `🎁 **Cosas geniales que tenemos:**\n`;
        const features = generateFeaturesList(data);
        features.forEach(feature => {
            template += `🌟 ${feature} - ¡Te va a encantar!\n`;
        });
        template += '\n';
        
        template += `🤝 **¿Quiénes pueden unirse?**\n`;
        template += `¡Todos son bienvenidos! Especialmente si eres:\n`;
        const roles = data.roles || data.community || "miembros activos";
        const roleList = roles.split(',').map(role => role.trim());
        roleList.forEach(role => {
            template += `😊 ${role} - ¡Nos encanta conocer gente nueva!\n`;
        });
        template += '\n';
        
        if (data.staff) {
            template += `👥 **Nuestro equipo genial:**\n`;
            template += `🌟 ${data.staff}\n`;
            template += `Son súper buena onda y siempre están dispuestos a ayudar.\n\n`;
        }
        
        template += `🚀 ¡Ven y únete a la diversión!\n`;
        template += `Prometemos que te vas a divertir muchísimo con nosotros.\n\n`;
        const serverLink = data.serverLink || "discord.gg/ejemplo";
        template += `💬 **¡Nos vemos en Discord!** ${serverLink}`;
        
    } else if (templateType === 'professional') {
        // Professional template with clean, organized structure
        template += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        template += `    🎯 ${data.serverName}\n`;
        template += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        template += `📋 **INFORMACIÓN GENERAL**\n`;
        template += `Servidor: ${data.serverType}\n`;
        if (data.gameMode) {
            template += `Modalidad: ${data.gameMode}\n`;
        }
        template += `Estado: Activo | Reclutando\n\n`;
        
        template += `🔧 **SERVICIOS Y CARACTERÍSTICAS**\n`;
        const features = generateFeaturesList(data);
        features.forEach((feature, index) => {
            template += `${index + 1}. ${feature}\n`;
        });
        template += '\n';
        
        template += `👤 **PERFILES SOLICITADOS**\n`;
        const roles = data.roles || data.community || "Miembros activos";
        const roleList = roles.split(',').map(role => role.trim());
        roleList.forEach(role => {
            template += `• ${role}\n`;
        });
        template += '\n';
        
        template += `📜 **REQUISITOS DE MEMBRESÍA**\n`;
        const requirements = generateRequirementsList(data);
        requirements.forEach((req, index) => {
            template += `${index + 1}. ${req}\n`;
        });
        template += '\n';
        
        if (data.staff) {
            template += `👨‍💼 **ADMINISTRACIÓN**\n`;
            template += `${data.staff}\n\n`;
        }
        
        template += `📞 **CONTACTO Y SOLICITUDES**\n`;
        const serverLink = data.serverLink || "discord.gg/ejemplo";
        template += `Discord: ${serverLink}\n`;
        template += `Proceso: Solicitud directa en Discord\n`;
        template += `Tiempo de respuesta: 24-48 horas`;
    }
    
    // Add additional info if provided
    if (data.additionalInfo) {
        template += `\n\n📌 **Información adicional:**\n${data.additionalInfo}`;
    }
    
    // Ensure template doesn't exceed 2000 characters
    if (template.length > 2000) {
        template = template.substring(0, 1997) + "...";
    }
    
    return template;
}

// These functions are now handled within generateAuthenticTemplate
// They have been replaced with more integrated logic that uses the training data patterns

function showResults(templates) {
    document.getElementById('results').classList.remove('hidden');
    
    const templatesGrid = document.getElementById('templates-grid');
    templatesGrid.innerHTML = '';
    
    Object.keys(templates).forEach(type => {
        const template = templates[type];
        const templateCard = createTemplateCard(type, template);
        templatesGrid.appendChild(templateCard);
    });
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function enableContinuousChat() {
    // Enable input after showing results
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.disabled = false;
    sendBtn.disabled = false;
    document.getElementById('send-icon').textContent = '📤';
    
    // Add feedback message
    setTimeout(() => {
        addMessage("¡Increíble! 🎉 He generado 5 plantillas únicas para tu servidor. ¿Qué te parecen?", false);
        
        setTimeout(() => {
            addMessage("Puedo ayudarte con cualquier modificación que necesites:", false);
            addMessage("• Cambiar enlaces: 'cambiar el link a discord.gg/nuevo'\n• Agregar staff: 'añadir 123456789-Owner'\n• Modificar características: 'agregar sorteos diarios'\n• Cambiar nombre: 'cambiar nombre a MiServidor'\n• O cualquier otra cosa que necesites", false);
        }, 1500);
        
        setTimeout(() => {
            addMessage("¿Hay algo que te gustaría ajustar o estás listo para usar las plantillas? 😊", false);
        }, 3000);
    }, 2000);
}

function processTemplateModification(message) {
    addMessage(message, true);
    
    const lowerMessage = message.toLowerCase();
    
    // Detectar solicitudes de modificación específicas
    const isStaffModification = lowerMessage.includes('líder') || lowerMessage.includes('lider') || 
        lowerMessage.includes('staff') || lowerMessage.includes('owner') || lowerMessage.includes('admin') ||
        lowerMessage.includes('moderador') || lowerMessage.includes('manager') || lowerMessage.includes('co-owner');
    
    const isLinkModification = lowerMessage.includes('link') || lowerMessage.includes('enlace') || 
        lowerMessage.includes('discord.gg') || lowerMessage.includes('invitación');
    
    const isNameModification = lowerMessage.includes('nombre') && (lowerMessage.includes('cambiar') || 
        lowerMessage.includes('cambia') || lowerMessage.includes('servidor'));
    
    const isFeatureModification = lowerMessage.includes('agregar') || lowerMessage.includes('añadir') || 
        lowerMessage.includes('agrega') || lowerMessage.includes('añade') || lowerMessage.includes('quitar') || 
        lowerMessage.includes('eliminar') || lowerMessage.includes('borrar');
    
    const isGeneralModification = lowerMessage.includes('modificar') || lowerMessage.includes('cambiar') || 
        lowerMessage.includes('actualizar') || lowerMessage.includes('editar');
    
    // Respuestas positivas/feedback
    const isPositiveFeedback = lowerMessage.includes('genial') || lowerMessage.includes('perfecto') || 
        lowerMessage.includes('me gusta') || lowerMessage.includes('excelente') || lowerMessage.includes('bien') ||
        lowerMessage.includes('bueno') || lowerMessage.includes('gracias') || lowerMessage.includes('increíble') ||
        lowerMessage.includes('fantástico') || lowerMessage.includes('ok') || lowerMessage.includes('vale');
    
    // Preguntas generales sobre las plantillas
    const isGeneralQuestion = lowerMessage.includes('qué') || lowerMessage.includes('como') || 
        lowerMessage.includes('cuál') || lowerMessage.includes('puedo') || lowerMessage.includes('dónde') ||
        lowerMessage.includes('por qué') || lowerMessage.includes('cuánto');
    
    if (isStaffModification) {
        const extractedStaff = extractStaffFromMessage(message);
        if (extractedStaff) {
            addMessage("¡Perfecto! He detectado nueva información de staff. Actualizando las plantillas...", false);
            disableInput();
            
            // Actualizar staff en chatData
            if (chatData.staff) {
                chatData.staff += '\n' + extractedStaff;
            } else {
                chatData.staff = extractedStaff;
            }
            
            regenerateTemplatesWithFeedback("¡Excelente! He agregado los nuevos líderes a todas las plantillas. Puedes ver los cambios arriba.");
        } else {
            addMessage("Entiendo que quieres agregar staff. Para mejores resultados, usa el formato: 'ID-Rol' o '@usuario - Rol'. Por ejemplo: '1234567890123456789-Owner' o '@usuario - Manager'", false);
        }
    } else if (isLinkModification) {
        const extractedLink = extractLinkFromMessage(message);
        if (extractedLink) {
            addMessage("¡Genial! He encontrado un nuevo enlace. Actualizando todas las plantillas...", false);
            disableInput();
            
            chatData.serverLink = extractedLink;
            regenerateTemplatesWithFeedback("¡Listo! He actualizado el enlace de Discord en todas las plantillas.");
        } else {
            addMessage("He notado que mencionas un enlace, pero no pude extraerlo claramente. ¿Podrías proporcionarlo en formato 'discord.gg/ejemplo' o 'https://discord.gg/ejemplo'?", false);
        }
    } else if (isNameModification) {
        const extractedName = extractServerNameFromMessage(message);
        if (extractedName) {
            addMessage("¡Entendido! Cambiando el nombre del servidor en todas las plantillas...", false);
            disableInput();
            
            chatData.serverName = extractedName;
            regenerateTemplatesWithFeedback(`¡Perfecto! He cambiado el nombre del servidor a "${extractedName}" en todas las plantillas.`);
        } else {
            addMessage("Entiendo que quieres cambiar el nombre del servidor. ¿Podrías especificar cuál es el nuevo nombre?", false);
        }
    } else if (isFeatureModification) {
        addMessage("¡Perfecto! Veo que quieres modificar las características. Procesando los cambios...", false);
        disableInput();
        
        processSpecificModifications(message, lowerMessage);
        chatData.modifications = (chatData.modifications || []);
        chatData.modifications.push(message);
        
        regenerateTemplatesWithFeedback("¡Excelente! He procesado tus cambios en las características. Las plantillas han sido actualizadas.");
        
    } else if (isGeneralModification) {
        addMessage("¡Por supuesto! Procesando tus modificaciones...", false);
        disableInput();
        
        processSpecificModifications(message, lowerMessage);
        chatData.modifications = (chatData.modifications || []);
        chatData.modifications.push(message);
        
        regenerateTemplatesWithFeedback("¡Listo! He aplicado tus modificaciones a todas las plantillas.");
        
    } else if (isPositiveFeedback) {
        const positiveResponses = [
            "¡Me alegra mucho que te gusten! 😊 ¿Hay algo más que te gustaría ajustar o modificar?",
            "¡Fantástico! Es genial escuchar eso. ¿Necesitas algún otro cambio en las plantillas?",
            "¡Excelente! Me complace que estés satisfecho con el resultado. ¿Algo más en lo que pueda ayudarte?",
            "¡Qué bueno que te hayan gustado! ¿Te gustaría hacer algún ajuste adicional o estás listo para usar las plantillas?",
            "¡Perfecto! Me da mucho gusto que las plantillas cumplan tus expectativas. ¿Hay algo más que quieras modificar?"
        ];
        const randomResponse = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
        addMessage(randomResponse, false);
        
    } else if (isGeneralQuestion) {
        provideHelpfulResponse(message, lowerMessage);
        
    } else {
        // Conversación natural e inteligente
        const conversationalResponses = [
            "Entiendo. ¿Podrías ser más específico sobre qué te gustaría modificar en las plantillas?",
            "Claro, estoy aquí para ayudarte. ¿Qué cambios tienes en mente para las plantillas?",
            "Por supuesto. ¿Hay algún aspecto particular de las plantillas que te gustaría ajustar?",
            "¡Perfecto! Cuéntame qué modificaciones necesitas y las implementaré de inmediato.",
            "Estoy listo para ayudarte con cualquier cambio. ¿Qué te gustaría modificar exactamente?",
            "Entiendo que quieres hacer algunos ajustes. ¿Podrías especificar qué cambios necesitas?",
            "¡Excelente! Estoy aquí para personalizar las plantillas según tus necesidades. ¿Qué modificarías?"
        ];
        
        // Si el mensaje es muy corto, dar respuesta más específica
        if (message.trim().length < 10) {
            addMessage("¡Hola! ¿En qué puedo ayudarte con las plantillas? Puedo modificar nombres, enlaces, staff, características, o cualquier otro detalle que necesites.", false);
        } else {
            const randomResponse = conversationalResponses[Math.floor(Math.random() * conversationalResponses.length)];
            addMessage(randomResponse, false);
        }
    }
}

// Función para extraer staff del mensaje
function extractStaffFromMessage(message) {
    // Patrones para detectar diferentes formatos de staff
    const patterns = [
        /(\d{17,19})\s*[-—]\s*([^\n,]+)/gi,  // ID-Rol
        /@(\w+)\s*[-—]\s*([^\n,]+)/gi,       // @usuario-Rol
        /(\d{17,19})\s*[-—]\s*(\w+)/gi,      // ID-Rol simple
        /añad[ie]r?\s+(.+?)(?:\s+como\s+)?(\w+)/gi,  // "añadir usuario como rol"
        /nuevo\s+(\w+).*?(\d{17,19})/gi      // "nuevo owner 123456"
    ];
    
    let extractedStaff = [];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(message)) !== null) {
            if (match[1] && match[2]) {
                const id = match[1].replace('@', '');
                const role = match[2].trim();
                extractedStaff.push(`<@${id}> - ${role}`);
            }
        }
    });
    
    // Si no encuentra patrones específicos, intentar extraer IDs sueltos
    if (extractedStaff.length === 0) {
        const idPattern = /\b(\d{17,19})\b/g;
        const ids = [...message.matchAll(idPattern)];
        if (ids.length > 0) {
            // Asumir que es un owner/admin si no se especifica
            const defaultRole = message.toLowerCase().includes('owner') ? 'Owner' : 
                               message.toLowerCase().includes('admin') ? 'Admin' : 
                               message.toLowerCase().includes('mod') ? 'Moderador' : 'Miembro';
            ids.forEach(match => {
                extractedStaff.push(`<@${match[1]}> - ${defaultRole}`);
            });
        }
    }
    
    return extractedStaff.length > 0 ? extractedStaff.join('\n') : null;
}

// Función para extraer enlaces del mensaje
function extractLinkFromMessage(message) {
    const patterns = [
        /(?:https?:\/\/)?discord\.gg\/([a-zA-Z0-9]+)/gi,
        /(?:https?:\/\/)?discordapp\.com\/invite\/([a-zA-Z0-9]+)/gi,
        /(https?:\/\/[^\s]+)/gi
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
            let link = match[0];
            if (!link.startsWith('http') && !link.startsWith('discord.gg')) {
                link = 'discord.gg/' + link;
            }
            return link;
        }
    }
    return null;
}

// Función para extraer nombre del servidor
function extractServerNameFromMessage(message) {
    const patterns = [
        /nombre\s+(?:del\s+servidor\s+)?(?:a\s+|es\s+|será\s+)?["']?([^"'.\n,]+)["']?/gi,
        /(?:cambiar|cambia)\s+(?:el\s+)?nombre\s+a\s+["']?([^"'.\n,]+)["']?/gi,
        /(?:se\s+)?llama\s+["']?([^"'.\n,]+)["']?/gi,
        /servidor\s+["']?([^"'.\n,]+)["']?/gi
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return null;
}

// Función para regenerar plantillas con feedback
function regenerateTemplatesWithFeedback(successMessage) {
    setTimeout(() => {
        try {
            const updatedTemplates = createTemplates(chatData);
            generatedTemplates = updatedTemplates;
            
            setTimeout(() => {
                updateTemplatesDisplay(updatedTemplates);
                enableInput();
                addMessage(successMessage, false);
                addMessage("¿Necesitas algún otro cambio o las plantillas están listas para usar? 😊", false);
            }, 1000);
        } catch (error) {
            console.error('Error regenerating templates:', error);
            addMessage("Ocurrió un error al actualizar las plantillas. Por favor inténtalo de nuevo.", false);
            enableInput();
        }
    }, 1500);
}

// Función para proporcionar respuestas útiles a preguntas
function provideHelpfulResponse(message, lowerMessage) {
    if (lowerMessage.includes('cómo') || lowerMessage.includes('como')) {
        if (lowerMessage.includes('usar') || lowerMessage.includes('utilizar')) {
            addMessage("¡Excelente pregunta! Para usar las plantillas, simplemente haz clic en el botón 'Copiar' de la plantilla que más te guste y pégala en Discord. Cada plantilla está optimizada para el límite de 2000 caracteres.", false);
        } else if (lowerMessage.includes('modificar') || lowerMessage.includes('cambiar')) {
            addMessage("¡Perfecto! Puedes modificar cualquier cosa diciéndome qué cambiar. Por ejemplo: 'cambiar el enlace a discord.gg/nuevo' o 'agregar un nuevo líder: ID-Owner'. ¡Es muy fácil!", false);
        } else {
            addMessage("¡Estoy aquí para ayudarte! Puedes preguntarme sobre cómo usar las plantillas, modificarlas, o cualquier otra duda que tengas.", false);
        }
    } else if (lowerMessage.includes('qué') || lowerMessage.includes('que')) {
        if (lowerMessage.includes('plantilla') || lowerMessage.includes('estilo')) {
            addMessage("¡Gran pregunta! Tienes 5 estilos únicos: Formal (profesional), Emocional (cálido y acogedor), Épico (dramático y poderoso), Amigable (casual y divertido), y Profesional (limpio y directo). ¿Cuál prefieres?", false);
        } else {
            addMessage("Puedo ayudarte con muchas cosas: modificar plantillas, cambiar información, explicar las diferencias entre estilos, o responder cualquier pregunta sobre las plantillas generadas.", false);
        }
    } else if (lowerMessage.includes('cuál') || lowerMessage.includes('cual')) {
        addMessage("¡Buena pregunta! La elección depende de tu servidor. Para clanes de Minecraft recomiendo el estilo Épico o Formal. Para comunidades sociales, el Emocional o Amigable. ¿Qué tipo de servidor es el tuyo?", false);
    } else {
        addMessage("Interesante pregunta. ¿Podrías ser más específico? Estoy aquí para ayudarte con cualquier aspecto de las plantillas.", false);
    }
}

function processSpecificModifications(message, lowerMessage) {
    // Extract new features to add
    if (lowerMessage.includes('agregar') || lowerMessage.includes('añadir')) {
        const addPatterns = [
            /(agregar|añadir)(?:\s+(?:la\s+)?(?:característica|feature)\s+)?:?\s*(.+)/gi,
            /(?:quiero\s+)?(?:agregar|añadir)\s+(.+)/gi
        ];
        
        for (const pattern of addPatterns) {
            const match = message.match(pattern);
            if (match) {
                const newFeature = match[2] || match[1];
                if (newFeature && newFeature.trim()) {
                    chatData.features = (chatData.features || '') + ', ' + newFeature.trim();
                    console.log('Added feature:', newFeature);
                    break;
                }
            }
        }
    }
    
    // Handle removing features
    if (lowerMessage.includes('quitar') || lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        const removePatterns = [
            /(quitar|eliminar|borrar)(?:\s+(?:la\s+)?(?:característica|feature)\s+)?:?\s*(.+)/gi,
            /(?:quiero\s+)?(?:quitar|eliminar|borrar)\s+(.+)/gi
        ];
        
        for (const pattern of removePatterns) {
            const match = message.match(pattern);
            if (match) {
                const featureToRemove = match[2] || match[1];
                if (featureToRemove && chatData.features) {
                    chatData.features = chatData.features.replace(new RegExp(featureToRemove.trim(), 'gi'), '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
                    console.log('Removed feature:', featureToRemove);
                    break;
                }
            }
        }
    }
}

function createTemplateCard(type, template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    
    const charCount = template.characterCount;
    const charClass = charCount <= 1800 ? 'good' : charCount <= 1950 ? 'warning' : 'danger';
    
    card.innerHTML = `
        <div class="template-header">
            <div class="template-info">
                <span class="template-icon">${template.icon}</span>
                <span class="template-name">${template.name}</span>
            </div>
            <span class="char-count ${charClass}">${charCount}/2000</span>
        </div>
        <div class="template-content">
            <div class="template-preview">${template.content}</div>
        </div>
        <div class="template-actions">
            <button class="btn-copy" onclick="copyTemplate('${type}')">
                <span id="copy-icon-${type}">📋</span>
                <span id="copy-text-${type}">Copiar</span>
            </button>
            <button class="btn-download-single" onclick="downloadTemplate('${type}')" title="Descargar">
                📥
            </button>
        </div>
    `;
    
    return card;
}

function copyTemplate(type) {
    const template = generatedTemplates[type];
    if (!template) return;
    
    const icon = document.getElementById(`copy-icon-${type}`);
    const text = document.getElementById(`copy-text-${type}`);
    const button = icon ? icon.parentElement : null;
    
    // Modern clipboard API with fallback
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(template.content).then(() => {
            showCopySuccess(icon, text, button);
        }).catch(err => {
            console.error('Clipboard API failed:', err);
            fallbackCopyToClipboard(template.content, icon, text, button);
        });
    } else {
        // Fallback for older browsers or non-secure contexts
        fallbackCopyToClipboard(template.content, icon, text, button);
    }
}

function showCopySuccess(icon, text, button) {
    if (icon) icon.textContent = '✅';
    if (text) text.textContent = 'Copiado';
    if (button) button.classList.add('copied');
    
    setTimeout(() => {
        if (icon) icon.textContent = '📋';
        if (text) text.textContent = 'Copiar';
        if (button) button.classList.remove('copied');
    }, 2000);
}

function showCopyError(icon, text, button) {
    if (icon) icon.textContent = '❌';
    if (text) text.textContent = 'Error';
    
    setTimeout(() => {
        if (icon) icon.textContent = '📋';
        if (text) text.textContent = 'Copiar';
    }, 2000);
}

function fallbackCopyToClipboard(content, icon, text, button) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showCopySuccess(icon, text, button);
        } else {
            showCopyError(icon, text, button);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyError(icon, text, button);
    }
}

function downloadTemplate(type) {
    const template = generatedTemplates[type];
    if (!template) return;
    
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla-${type}-${chatData.serverName || 'servidor'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadAllTemplates() {
    if (!generatedTemplates) return;
    
    let allContent = '';
    Object.keys(generatedTemplates).forEach(type => {
        const template = generatedTemplates[type];
        allContent += `=== ${template.name.toUpperCase()} ===\n`;
        allContent += `Caracteres: ${template.characterCount}/2000\n\n`;
        allContent += template.content;
        allContent += '\n\n' + '='.repeat(50) + '\n\n';
    });
    
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantillas-${chatData.serverName || 'servidor'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function startOver() {
    // Reset all variables
    currentStep = 0;
    chatData = {};
    generatedTemplates = null;
    isGenerating = false;
    questions = [];
    questionKeys = [];
    canAskMoreQuestions = true;
    
    // Hide results and chat interface
    document.getElementById('results').classList.add('hidden');
    document.getElementById('chat-interface').classList.add('hidden');
    document.getElementById('start-section').classList.remove('hidden');
    
    // Clear chat messages
    document.getElementById('chat-messages').innerHTML = '';
    
    // Reset input
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;
    document.getElementById('send-icon').textContent = '📤';
    
    // Reset progress
    document.getElementById('progress-text').textContent = '0/2 preguntas';
    document.getElementById('progress-fill').style.width = '0%';
    
    // Scroll to generator
    scrollToGenerator();
}

function updateTemplatesDisplay(templates) {
    const templatesGrid = document.getElementById('templates-grid');
    templatesGrid.innerHTML = '';
    
    Object.keys(templates).forEach(type => {
        const template = templates[type];
        const templateCard = createTemplateCard(type, template);
        templatesGrid.appendChild(templateCard);
    });
    
    // Add update animation
    templatesGrid.style.opacity = '0.5';
    setTimeout(() => {
        templatesGrid.style.opacity = '1';
    }, 300);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load template configuration on page load
    loadTemplateConfig();
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
