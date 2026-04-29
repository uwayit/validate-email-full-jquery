/**
 * Скрипт валідації email для фронтенду.
 * Повністю синхронізований з серверною логікою (PHP).
 * 
 * @author uwayit
 * @link https://github.com/uwayit/validate-email-full-jquery
 */

(function(window, $) {
    'use strict';

    // --- Конфігурація та константи ---
    const CONFIG = {
        restrictedDomains: ['ya.ru', 'yandex', 'mail.ru', 'bk.ru', 'mail.ua', 'inbox.ru', 'gmail.com', 'list.ru'],
        invalidPatterns: ['..', '-.', '.-', '_.', '._', '--', '-_', '_-', '__'],
        anonimayzers: [
            'scryptmail.com', '10minutemail.com', '10minutemail.net', 'guerrillamail.com', 'mailinator.com',
            'temp-mail.org', 'dropmail.me', 'dispostable.com', 'trashmail.com', 'yopmail.com'
        ],
        badZones: ['xxx', 'biz', 'cc'],
        domainCorrections: {
            'ru': ['ry', 'rv', 'ri', 'rn', 'tu', 'ty', 'my'],
            'com': ['cjm', 'cpm', 'kom', 'gom', 'vom', 'con', 'kon', 'cm', 'om', 'cim', 'som', 'xom', 'cox'],
            'org': ['orq', 'opq', 'opg'],
            'ua': ['ya'],
            'net': ['ner', 'het', 'bet', 'nen', 'nit', 'met', 'ney', 'ne', 'nwt']
        },
        nameCorrections: {
            'yandex': ['yandax', 'yandeks', 'yandx', 'yangex', 'jandex', 'yadex', 'uandex', 'yndex', 'ayndex'],
            'bigmir': ['digmir', 'biqmir', 'diqmir'],
            'mail': [
                'mfil', 'meil', 'msil', 'maij', 'maill', 'mil', 'imeil', 'mael', 'maii', 'mali', 'mal', 'majl', 'maul',
                'masl', 'maik', 'ail', 'naul', 'nail'
            ],
            'icloud': ['cloud', 'ikloud', 'iclout', 'icloub', 'cloub'],
            'gmail': [
                'gamailcom', 'gmaill', 'gmailco', 'gmel', 'qm', 'gmjl', 'gmm', 'gmaa', 'ggmai', 'cmal', 'cail', 'gail',
                'gmal', 'gmei', 'gmaij', 'gmajl', 'qnail', 'gnail', 'gmeil', 'gmall', 'jmail', 'gmaii', 'gmali', 'hmail',
                'gmael', 'jimal', 'jmeil', 'qhail', 'gmoil', 'ghail', 'cmail', 'gamil', 'dmail', 'gmaik', 'gmоil', 'gimajl',
                'gimail', 'qemail', 'gomail', 'gemeil', 'gemail', 'gamail', 'gameil', 'gmaul', 'qeimal', 'glail', 'gmaile',
                'goi', 'qoi', 'gmfql', 'gmd'
            ]
        },
        stoppedDomains: [
            'com.ua', 'ua.com', 'kom.ua', 'kis.ru', 'kom.ru', 'com.ru', 'ru.com', 'meil.com', 'mael.com', 'emeil.ru', 'emeil.com', 'imeil.ua', 'com.com',
            'net.ua', 'net.ru', 'com.net', 'example.com', 'sitemail.com', 'site.com', 'email.com', 'mailcom.ru',
            'yahoo.net', 'hotmail.ru', 'ramler.ru', 'ramdler.ru', 'rambler.com', 'yaho.com',
            'ua.net', 'ykr.net', 'ykt.net', 'ukt.net', 'ucr.net', 'ukr.com',
            'bigmir.ua', 'bigmir.com', 'gmail.ru', 'gmail.ua', 'gmail.com.ua', 'gmail.com.ru',
            'ya.ua', 'ya.com', 'yande.ru', 'yande.ua', 'inboks.ru', 'indox.ru',
            'list.ua', 'list.com', 'iist.ru', 'iist.ua', 'bk.com', 'bk.ua', 'dk.com', 'br.com', 'dk.ru', 'br.ru', 'bl.ru', 'bj.ru',
            'vk.ru', 'vk.com', 'vkontakte.ru', 'mail.com', 'mail.com.ua', 'mail.com.ru'
        ],
        domainRules: {
            'i.ua': 6, 'ro.ru': 6, 'r0.ru': 6, 'rambler.ru': 6, 'lenta.ru': 6,
            'myrambler.ru': 6, 'gmail.com': 5, 'mail.ru': 3, 'mail.ua': 3,
            'inbox.ru': 3, 'list.ru': 3, 'bk.ru': 3
        }
    };

    // --- Обробка подій ---
    $(document).on('change keypress keydown keyup', '.email', function() {
        const $el = $(this);
        $el.removeClass('error');
        $('.errormail').hide();
        $('.testEmailButton, .sendButton').prop('disabled', false).removeClass('disbtn');
    });

    /**
     * Головна функція перевірки email
     * @param {HTMLElement|jQuery} emailObj - Об'єкт інпуту
     * @returns {string|boolean} - Виправлений email або false при помилці
     */
    window.testEmail = function(emailObj) {
        const $btn = $('.testEmailButton, .sendButton');
        $btn.prop('disabled', true).addClass('disbtn');

        let email = $(emailObj).val();
        email = initialPreparation(email);

        // Початкові перевірки
        if (!email || email === 'email' || email === 'youremail') return sendError(emailObj, 'placeholder');

        email = cleanWww(email);
        email = clearPlus(email);
        
        // Швидкі виправлення
        email = email.replace('yandex.com.ua', 'yandex.ua').replace('gmail.com.ua', 'gmail.com');

        let epart = parseEmail(email);
        email = sborka(epart);

        // Основна валідація
        if (numberTest(epart.domainAll)) return sendError(emailObj, 'numberTestTest');
        if (isLie(email)) return sendError(emailObj, 'isLieTest');
        if (!validateRegex(email)) return sendError(emailObj, 'regulyarTest');
        if (stopAnonimayzer(epart.domainAll)) return sendError(emailObj, 'stopAnonimayzerTest');
        if (sintaksisValid(epart)) return sendError(emailObj, 'sintaksisValidTest');

        // Авто-корекція доменів
        epart.domainOnly = correctName(epart.domainOnly);
        email = sborka(epart);

        // Додаткові перевірки
        if (domainZoneLength(epart.domainZone)) return sendError(emailObj, 'domainZoneLenght');
        if (stopDomainALL(epart)) return sendError(emailObj, 'stopDomainALLTest');
        if (oneLetter(epart.domainAll)) return sendError(emailObj, 'oneLetterTest');
        if (badZone(epart.domainZone)) return sendError(emailObj, 'badZoneTest');

        // Нормалізація
        email = buildStandartEmail(email);
        epart = parseEmail(email); // Оновлюємо частини після нормалізації

        // Фінальні правила
        if (yaPhone(epart)) return sendError(emailObj, 'yaphoneTest');
        if (minLength(epart)) return sendError(emailObj, 'minLengthTest');
        if (tireStop(epart.domainOnly, epart.localPart)) return sendError(emailObj, 'tireStopTest');
        
        if (neNa(epart.domainAll)) return sendError(emailObj, 'neNaTest');

        // Успішне завершення
        $btn.prop('disabled', false).removeClass('disbtn');
        $(emailObj).val(email);
        return email;
    };

    // --- Допоміжні функції (закриті в замиканні) ---

    function sendError(emailObj, error) {
        $(`.${error}`).show();
        $(emailObj).addClass('error');
        $('.testEmailButton, .sendButton').prop('disabled', true).addClass('disbtn');
        return false;
    }

    function parseEmail(email) {
        const lastAt = email.lastIndexOf('@');
        const localPart = email.slice(0, lastAt);
        const domainAll = email.slice(lastAt + 1);
        const lastPoint = domainAll.lastIndexOf('.');
        
        const domainZone = correctDomainZone(domainAll.slice(lastPoint + 1));
        const domainOnly = domainAll.slice(0, lastPoint);

        return {
            localPart,
            domainAll: `${domainOnly}.${domainZone}`,
            domainOnly,
            domainZone
        };
    }

    function sborka(epart) {
        return `${epart.localPart}@${epart.domainOnly}.${epart.domainZone}`;
    }

    function initialPreparation(email) {
        if (!email) return '';
        email = email.trim().replace(/\s+/g, '').toLowerCase();
        return email.startsWith('+') ? email.slice(1) : email;
    }

    function cleanWww(email) {
        return email.startsWith('www.') ? email.slice(4) : email;
    }

    function clearPlus(email) {
        const posPlus = email.lastIndexOf('+');
        const posAt = email.indexOf('@');
        if (posPlus > 0 && posAt > posPlus) {
            return email.slice(0, posPlus) + email.slice(posAt);
        }
        return email;
    }

    const numberTest = (domainAll) => /\d/.test(domainAll);

    function isLie(email) {
        const domain = email.split('@')[1];
        if (domain === window.location.host || `www.${domain}` === window.location.host) return true;
        
        const badOnes = ['mail@mail.ru', 'gmail@gmail.com', 'email@mail.ua', 'email@example.com', 'test@test.com'];
        return badOnes.includes(email);
    }

    const validateRegex = (email) => /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,12}$/.test(email);

    function sintaksisValid(epart) {
        const isRestricted = CONFIG.restrictedDomains.some(d => epart.domainAll.includes(d));
        if (isRestricted && CONFIG.invalidPatterns.some(p => epart.localPart.includes(p))) return true;

        const first = epart.localPart[0];
        const last = epart.localPart[epart.localPart.length - 1];
        const symbols = ['.', '-', '_'];
        if (symbols.includes(first) || symbols.includes(last)) return true;

        if (epart.domainAll.split('.').length > 3) return true;
        if (/\d/.test(epart.domainZone)) return true;

        return false;
    }

    function correctDomainZone(zone) {
        for (const [correct, errors] of Object.entries(CONFIG.domainCorrections)) {
            if (errors.includes(zone)) return correct;
        }
        return zone;
    }

    function correctName(name) {
        for (const [correct, errors] of Object.entries(CONFIG.nameCorrections)) {
            if (errors.includes(name)) return correct;
        }
        return name;
    }

    const stopDomainALL = (epart) => CONFIG.stoppedDomains.includes(epart.domainAll) || ['yy', 'aa'].includes(epart.domainZone);

    function oneLetter(domainAll) {
        if (domainAll.includes('i.ua') || domainAll.includes('a.ua')) return false;
        return domainAll.split('.')[0].length === 1;
    }

    const domainZoneLength = (zone) => zone.length > 15;
    const badZone = (zone) => CONFIG.badZones.includes(zone);
    const stopAnonimayzer = (domainAll) => CONFIG.anonimayzers.includes(domainAll);

    function minLength(epart) {
        const min = CONFIG.domainRules[epart.domainAll] || 3;
        return epart.localPart.length < min;
    }

    const tireStop = (domainOnly, localPart) => domainOnly.includes('yandex') && localPart.includes('_');
    const neNa = (domainAll) => ['my.com', 'rambler.ua'].includes(domainAll);

    function buildStandartEmail(email) {
        const [box] = email.split('@');
        if (/@(?:yandex\.[a-z]{2,3}|ya\.ru|narod\.ru)$/i.test(email)) return `${box.replace(/-/g, '.')}@yandex.ru`;
        if (/@(gmail\.com|googlemail\.com)$/i.test(email)) return `${box.replace(/\./g, '')}@gmail.com`;
        if (/@(pm\.me|proton\.me|protonmail\.com)$/i.test(email)) return `${box.replace(/\./g, '')}@proton.me`;
        if (/@icloud\.com$/i.test(email)) return `${box.replace(/\./g, '')}@icloud.com`;
        if (/@ymail\.com$/i.test(email)) return `${box}@yahoo.com`;
        return email;
    }

    function yaPhone(epart) {
        if (/yandex|ya\.ru/.test(epart.domainAll)) {
            const codes = [/^380/, /^37/, /^99/, /^79/, /^89/, /^77/];
            if (codes.some(c => c.test(epart.localPart)) && /^\d{11,13}$/.test(epart.localPart)) return true;
        }
        return false;
    }

})(window, jQuery);
