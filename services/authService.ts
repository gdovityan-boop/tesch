import { User } from '../types';
import { WEB_APP_URL, TELEGRAM_BOT_TOKEN } from './mockData';

/**
 * AUTH SERVICE (CLIENT-SIDE)
 * Реализация отправки:
 * 1. Telegram API (прямой запрос)
 * 2. EmailJS (для Email без бэкенда)
 */

const getSettings = () => {
    const storedSettings = localStorage.getItem('telegram_settings');
    if (storedSettings) {
        try {
            return JSON.parse(storedSettings);
        } catch (e) {
            console.error('Error parsing settings', e);
        }
    }
    return {};
};

export const authService = {
    /**
     * Отправляет инструкцию по сбросу пароля.
     */
    async sendPasswordReset(user: User): Promise<{ success: boolean; message: string }> {
        const tempPassword = Math.random().toString(36).slice(-8); // Генерируем случайный пароль
        const loginLink = WEB_APP_URL || window.location.origin;
        const settings = getSettings();

        // 1. TELEGRAM SENDING
        if (user.registrationSource === 'TELEGRAM' && user.telegramId) {
            const token = settings.botToken || TELEGRAM_BOT_TOKEN;
            try {
                const text = `
🔐 <b>Сброс пароля / Password Reset</b>

Привет, ${user.name}!
Ваш новый пароль для входа: <code>${tempPassword}</code>

🔗 <a href="${loginLink}">Войти в систему</a>
                `;

                const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: user.telegramId,
                        text: text,
                        parse_mode: 'HTML'
                    })
                });

                const data = await response.json();

                if (data.ok) {
                    return { success: true, message: `✅ Успешно! Новый пароль (${tempPassword}) отправлен в Telegram.` };
                } else {
                    if (data.error_code === 403) return { success: false, message: '❌ Пользователь заблокировал бота.' };
                    return { success: false, message: `❌ Ошибка Telegram: ${data.description}` };
                }

            } catch (error) {
                return { success: false, message: '❌ Ошибка сети (Telegram).' };
            }
        } 
        
        // 2. EMAIL SENDING (VIA EMAILJS)
        else {
            if (!settings.emailServiceId || !settings.emailTemplateId || !settings.emailPublicKey) {
                console.warn('EmailJS not configured in Admin Panel');
                // Fallback to simulation if keys are missing
                return {
                    success: true,
                    message: `ℹ️ EmailJS не настроен. Симуляция: Пароль ${tempPassword} для ${user.email}`
                };
            }

            try {
                const templateParams = {
                    to_email: user.email,
                    to_name: user.name,
                    message: `Ваш новый пароль: ${tempPassword}`,
                    link: loginLink
                };

                const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service_id: settings.emailServiceId,
                        template_id: settings.emailTemplateId,
                        user_id: settings.emailPublicKey,
                        template_params: templateParams
                    })
                });

                if (response.ok) {
                    return { success: true, message: `✅ Письмо с паролем успешно отправлено на ${user.email} (через EmailJS).` };
                } else {
                    const errorText = await response.text();
                    return { success: false, message: `❌ Ошибка EmailJS: ${errorText}` };
                }
            } catch (error) {
                return { success: false, message: '❌ Ошибка сети при отправке Email.' };
            }
        }
    },

    /**
     * Администратор сбрасывает пароль пользователю
     */
    async adminResetUserPassword(admin: User, targetUser: User): Promise<{ success: boolean; message: string }> {
        console.log(`[Audit] Admin ${admin.name} requested reset for ${targetUser.name}`);
        return this.sendPasswordReset(targetUser);
    }
};
