const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot('6607187978:AAFyLrXQOCtdg2lyqElu7FN0EevgbpaTwsg', { polling: true });

// Object to store user states
const userState = {};

// Listener for "/start" command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome to the GPA Calculator Bot! Send /help to see available commands.");
});

// Listener for "/help" command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = "This bot helps you calculate SGPA, YGPA, and DGPA.\n\nCommands:\n/sgpa (credits You earned) (Total Credits) : - Calculate SGPA -(e.g., /sgpa 176 20.5)  \n /ygpa (Even sem Credits earned) (Odd Sem Credits earned) (Total even credits) (Total Odd credits) : - Calculate YGPA -(eg. /ygpa 176 130.5 20.5 17.5)\n/dgpa - Calculate DGPA\n/grade_to_percentage - Convert grade to percentage\n";
    bot.sendMessage(chatId, helpMessage);
});

// Listener for "/sgpa" command
bot.onText(/\/sgpa/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Please enter your total credit index earned and total credits earned in the following format: /sgpa CreditIndex TotalCredits (e.g., /sgpa 176 20.5)");
});

// Listener for "/ygpa" command
bot.onText(/\/ygpa/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Please enter the even semester credit index, odd semester credit index, total credits of even semester, and total credits of odd semester in the following format: EvenCreditIndex OddCreditIndex EvenTotalCredits OddTotalCredits (e.g., /ygpa 300 290 60 60)");
});

// Listener for "/grade_to_percentage" command
bot.onText(/\/grade_to_percentage/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Please enter your grade in the following format: Grade (e.g., 8.5)");
});

// Listener for "/dgpa" command
bot.onText(/\/dgpa/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Please select the type of DGPA calculation:\n1. Lateral\n2. Regular\n\nReply with the corresponding number.");
    // Set user state to 'dgpa' to indicate that the user is now selecting DGPA calculation type
    userState[chatId] = 'dgpa';
});

// Listener for receiving messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    // Check user state
    if (userState[chatId] === 'dgpa') {
        // User is selecting DGPA calculation type
        if (message === '1') {
            bot.sendMessage(chatId, "Please enter your YGPA for 2nd year, 3rd year, and 4th year in the following format: YGPA2 YGPA3 YGPA4 (e.g., 3.5 3.6 3.7)");
            // Set user state to 'dgpa_lateral' to indicate that the user is now providing YGPAs for lateral DGPA calculation
            userState[chatId] = 'dgpa_lateral';
        } else if (message === '2') {
            bot.sendMessage(chatId, "Please enter your YGPA for 1st year, 2nd year, 3rd year, and 4th year in the following format: YGPA1 YGPA2 YGPA3 YGPA4 (e.g., 3.0 3.5 3.6 3.7)");
            // Set user state to 'dgpa_regular' to indicate that the user is now providing YGPAs for regular DGPA calculation
            userState[chatId] = 'dgpa_regular';
        } else {
            bot.sendMessage(chatId, "Invalid input. Please select 1 or 2 for DGPA calculation type.");
        }
    } else if (userState[chatId] === 'dgpa_lateral') {
        // Process DGPA calculation for lateral
        const [ygpa2, ygpa3, ygpa4] = message.split(' ');
        const dgpa = (parseFloat(ygpa2) + 1.5 * parseFloat(ygpa3) + 1.5 * parseFloat(ygpa4)) / 4;
        bot.sendMessage(chatId, `Your calculated DGPA (Lateral) is: ${dgpa.toFixed(2)}`);
        // Reset user state after DGPA calculation
        delete userState[chatId];
    } else if (userState[chatId] === 'dgpa_regular') {
        // Process DGPA calculation for regular
        const [ygpa1, ygpa2, ygpa3, ygpa4] = message.split(' ');
        const dgpa = (parseFloat(ygpa1) + parseFloat(ygpa2) + 1.5 * parseFloat(ygpa3) + 1.5 * parseFloat(ygpa4)) / 5;
        bot.sendMessage(chatId, `Your calculated DGPA (Regular) is: ${dgpa.toFixed(2)}`);
        // Reset user state after DGPA calculation
        delete userState[chatId];
    } else {
        // Handle other commands and calculations
        if (message.startsWith('/sgpa')) {
            const [creditIndex, totalCredits] = message.substring(6).split(' ');
            const calculatedSGPA = parseFloat(creditIndex) / parseFloat(totalCredits);
            bot.sendMessage(chatId, `Your calculated SGPA is: ${calculatedSGPA.toFixed(2)}`);
        } else if (message.startsWith('/ygpa')) {
            const [evenCreditIndex, oddCreditIndex, evenTotalCredits, oddTotalCredits] = message.substring(6).split(' ');
            const ygpa = (parseFloat(evenCreditIndex) + parseFloat(oddCreditIndex)) / (parseFloat(evenTotalCredits) + parseFloat(oddTotalCredits));
            bot.sendMessage(chatId, `Your calculated YGPA is: ${ygpa.toFixed(2)}`);
        } else if (message.startsWith('/grade_to_percentage')) {
            bot.sendMessage(chatId, "Please enter your grade in the following format: Grade (e.g., 8.5)");
        } else if (!isNaN(parseFloat(message))) {
            const grade = parseFloat(message);
            if (grade >= 0 && grade <= 10) {
                const percentage = (grade - 0.75) * 10;
                bot.sendMessage(chatId, `Equivalent percentage for grade ${grade}: ${percentage.toFixed(2)}%`);
            } else {
                bot.sendMessage(chatId, "Invalid grade. Please enter a number between 0 and 10.");
            }
        }
    }
});

