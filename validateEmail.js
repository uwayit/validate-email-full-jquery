// Скрипт може проводити валидацію email та показувати СТАНДАРТИЗОВАНІ помилки
// Делатльна інструкція та можливості https://github.com/uwayit/validate-email-full-jquery


// Коли починається взаємодія з полем
// Ховаемо всі повідомлення про помилки в email
$('.email').bind('change keypress keydown keyup', function () {
    $(this).removeClass('errorField');
    $('.errormail').hide();
    // Знімаємо блокування кнопки відправки форми (якщо потрібно)
    // Для цього кнопка має містити .testEmailButton
    $('.testEmailButton').prop('disabled', false);
    $('.testEmailButton').removeClass('disbtn');
});

// Запускаємо перевірку поля з email
function testEmail(emailObj) {
    // Блокуємо кнопку на період аналізу відправки форми (дуже бажано)
    // Блокування кнопки знімається автоматично якщо все окей і НЕ знімається якщо є помилка
    $('.testEmailButton').prop('disabled', true);
    $('.testEmailButton').addClass('disbtn');

    // Берем з об'єкту email
    let email = $(emailObj).val();

    // Чистимо мило від УСІХ пробілів та плюсу на початку
    // приводимо до нижнього регістру
    email = initialPreparation(email);

    // Згладжуємо можливі (js) баги value, placeholder etc
    if (!email || email === 'email' || email === 'youremail') {
        sendError(emailObj, 'placeholder');
        // Перериваємо подальші перевірки
        return false;
    }

    // Тихо видаляємо www в мильнику, бо то явно помилка і йдемо далі
    email = cleanWww(email);

    // Деперсоналізуємо email видаляючи з нього додаткові фільтруючі патерни
    // myemail+work@gmail.com = myemail@gmail.com
    email = clearPlus(email);

    // Перевірка та мовчазне непомітне для клієнта виправлення найбільш типових та явних друкарських помилок у мильниках
    email = email.replace('yandex.com.ua', 'yandex.ua');
    email = email.replace('gmail.com.ua', 'gmail.com');

    // Розбираємо email на частини
    let epart = {};
    // Якщо точка є, то тут буде кількість символів до точки
    epart['lastPoint'] = email.lastIndexOf('.');
    // Якщо собачка є, то тут буде кількість символів до собачки
    epart['lastAt'] = email.lastIndexOf('@');
    epart['domainZone'] = correctDomainZone(email.slice(epart['lastPoint'] + 1)); // com
    epart['localPart'] = email.slice(0, epart['lastAt']);   // все до собачки
    epart['domainAll'] = email.slice(epart['lastAt'] + 1); // gmail.com
    epart['domainOnly'] = email.slice(epart['lastAt'] + 1, epart['lastPoint']); // gmail or subdomain.domain

    // Тут потрібно перезібрати, щоб всі зміни накшталт correctDomainZone було застосовано
    email = sborka(epart);
    
    // Оголошуємо перевірки
    // Для чого оголошуємо? Для зручності подальшого налаштування
    // Звдяки цьому, будь який рядок з непотрібною функцією НИЖЧЕ можна закоментувати, наприклад
    // numberTestTest = numberTest(epart['domainAll'], emailObj);
    // і тоді дія/заміна/перевірка яку виконує функція - просто пропускатиметься
    let numberTestTest = false       // numberTest
    let isLieT = false               // 
    let grubo = false                // 
    let stopAnonimayzerTest = false  // 
    let yaphoneTest = false          // 
    let tireStopTest = false         // 
    let neNaTest = false             // 
    let stopDomainALLTest = false    // 
    let oneLetterTest = false        // 
    let domainZoneLenghtTest = false // 
    let sintaksisValidTest = false   // 
    let badZoneTest = false          // 
    let minLengthTest = false        // 


    // Перевіряємо на цифри у доменному імені
    // Вирішив, що немає сенсу приймати заявку якщо в домені мила клієнта є хоч одна цифра,
    // так як відсоток реальних заявок із цифрами в домені близький до нуля
    // а ось друкарських помилок на зразок vova@1999gmail.com - безліч
    // Тому тут навіть видалення цифр не допоможе виправити ситуацію, бо email точно буде некоректним
    // а отже просимо користувача виправити помилку
    numberTestTest = numberTest(epart.domainAll);
    if (numberTestTest) {
        // Виводимо помилку numberTest
        // Повідомляємо йому про те, що цифри в домені недопускаються
        sendError(emailObj, 'numberTestTest');
        // Перериваємо подальшу обробку
        return false;
    }

    // Не даємо клієнту вказувати відверто брехливі email
    isLieT = isLie(email);
    if (isLieT) {
        sendError(emailObj, 'isLieTest');
        return false;
    }

    // Перевірка регулярним виразом
    // ! Ця перевірка не дає можливості вказувати кіріличні пошти
    // В кожного володаря кіріличної перлини в будь якому випадку точно є нормальна пошта
    // Тож нехай вказує її
    grubo = validateEmail(email);
    if (!grubo) {
        sendError(emailObj, 'regulyarTest');
        return false;
    }


    // Якщо юзер використовує анонімайзер, тобто тимчасову, однохвилину пошту
    stopAnonimayzerTest = stopAnonimayzer(epart.domainAll);
    if (stopAnonimayzerTest) {
        // Якщо факт використання анонімайзеру - це нахабство:
        // то можна брати його IP чи fingerprint та відправляти в стоп ліст
        // щоб забанити і ускладнити йому можливість подати заявку
        // По замовчуванню ми цього не робимо
        // просто повідомляю юзеру про те, що тимчасові пошти використовувати заборонено
        sendError(emailObj, 'stopAnonimayzerTest');
        return false;
    }



    // Перевіряємо синтаксис імені
    sintaksisValidTest = sintaksisValid(epart);
    if (sintaksisValidTest) {
        sendError(emailObj, 'sintaksisValidTest');
        return false;
    }

    // Автоматично виправляємо найпоширеніші друкарські помилки в домені
    epart.domainOnly = correctName(epart.domainOnly);
    email = sborka(epart);

    // Якщо домена зона складається більше ніж з N букв (3-5), то це найвірогідніше помилка
    domainZoneLenghtTest = domainZoneLenght(epart.domainZone);
    if (domainZoneLenghtTest) {
        sendError(emailObj, 'domainZoneLenght');
        return false;
    }

    // Не даємо клієнту вказувати ящики на перелічених нижче доменах та доменних зонах
    // Здебільшого це захист від помилкового введення того що після собачки
    stopDomainALLTest = stopDomainALL(email);
    if (stopDomainALLTest) {
        sendError(emailObj, 'stopDomainALLTest');
        return false;
    }

    // Поштові домени в світі (хіба за виключенням i.ua та a.ua)
    // Не можуть бути з одної букви
    oneLetterTest = oneLetter(epart.domainAll);
    if (oneLetterTest) {
        sendError(emailObj, 'oneLetterTest');
        return false;
    }




    // Якщо домена зона - є в цьому переліку, то повертаємо помилку
    badZoneTest = badZone(epart.domainZone);
    if (badZoneTest) {
        sendError(emailObj, 'badZoneTest');
        return false;
    }


    // Приводимо всі синоніми до кореневого вигляду
    email = buildStandartEmail(email);

    // email які починаються з номерів телефонів в яндексі є синонімами основних ящиків
    // Тож в ідеалі треба забороняти використовувати yandex email що починаються з телефонів 
    // І вимагати вказання кореневого email
    // Я не використовую цю перевірку, бо не працюю на сосії
    yaphoneTest = yaPhone(epart);
    if (yaphoneTest) {
        sendError(emailObj, 'yaphoneTest');
        return false;
    }

    // Якщо довжина email до собачки надто коротка
    minLengthTest = minLength(epart);
    if (minLengthTest) {
        sendError(emailObj, 'minLengthTest');
        return false;
    }

    // Деякі поштовики забороняють використовувати _ в адресі
    tireStopTest = tireStop(epart.domainOnly, epart.localPart);
    if (tireStopTest) {
        sendError(emailObj, 'tireStopTest');
        return false;
    }

    // Якщо ви не хочете приймати заявкі 
    // з mail.ru чи proton.me тому що маєте упередження
    // чи ваші листи кудить не доходять
    // Ви можете додати домени в перелік в neNa()
    neNaTest = neNa(epart.domainAll);
    if (neNaTest) {
        sendError(emailObj, 'Not on ' + neNaTest);
        return false;
    }
    // Якщо все окей, знімаємо блокування кнопки відправки форми
    $('.testEmailButton').prop('disabled', true);
    $('.testEmailButton').addClass('disbtn');


    // Виводимо змінений email в формі візуально
    $(emailObj).val(email);
    // Відаємо 
    return email;

}


// Пушимо користувачу повідомлення про помилку
// Другим параметром (ідентифікатором помилки) може бути лише одне слово латиницею або word_word
function sendError(emailObj, error) {
    console.log(error);
    $('.' + error).show();
    $(emailObj).addClass('errorField');
    return true;
}

// Збираємо email з частин
function sborka(epart) {
    return epart['localPart'] + '@' + epart['domainOnly'] + '.' + epart['domainZone'];;
}



// Тихо видаляє з поля з email УСІ пробіли та знак "+" на початку мила
// та приводимо до нижнього регістру
function initialPreparation(email) {
    if (email) {
        // Видаляємо пробіли на початку і в кінці рядка та всі пробіли всередині рядка 
        email = email.trim().replace(/\s+/g, '').toLowerCase();
        // видаляємо плюс на початку
        if (email[0] == '+') {
            email = email.substr(1);
        }
    }
    return email
}

// Тихо видаляємо www в мильнику, бо то явно помилка і йдемо далі
// АЛЕ
// Краще насправді не видаляти і не йти далі, а просити клієнта все перевірити і виправити помилки самостійно
// Бо кліент вірогідно дуже погано розуміє що таке email і де його взяти
// Отож статистично, якщо він вводить email починаючи з www то там неправильно не тільки це, а взагалі все введено від балди
// Тож я просто видаляю www, а ви можете наприклад видати помилку (приклади виводу помилок вище)
function cleanWww(email) {
    if (email.startsWith("www.")) {
        return email.substring(4);
    }
    return email;
}

// якщо плюс у середині мила: Тихо видаляє знак плюс "+" і все, що після нього до собачки
// Дозволяє деперсоналізувати введення email
function clearPlus(email) {
    let pos_plus = email.lastIndexOf('+');
    if (pos_plus > 0) {
        return email.substring(0, pos_plus) + email.substring(email.indexOf('@'));
    }
    return email;
}


// Перевіряємо на наявність цифри в домені
// Ми недопускаємо цифри (хоч в корпоративних вони можливі, але неймовірно рідкісні)
function numberTest(domainAll) {
    return /\d/.test(domainAll);
}

// Не даємо клієнту вказувати відверто брехливі email
function isLie(email) {
    // Якщо клієнт на сайті example.com подає заявку
    // то всі скриньки з домену @example.com не можна використовувати як скриньку
    let doman_email = email.split('@');
    if (doman_email[1] == window.location.host || 'www.' + doman_email[1] == window.location.host) {
        return true
    }
    let email_not_you = [
        // Відверті невірні та/або брехливі ящики
        // Достовірно відомо - таких немає у клієнтів
        // Сюди можна також внести наприклад наші email або якісь конкретні
        'mail@mail.ru', 'gmail@gmail.com', 'email@mail.ua', 'email@example.com'
    ];
    for (let cx = 0; cx < email_not_you.length; cx++) {
        if (email_not_you[cx] == email) {
            // Разом з відхиленням email ми можемо
            // запам'ятовувати факт спроби вказівки клієнтом брехливої ​​інформації
            // та передати цю інформацію на сервер разом із заявкою
            // Я не розробляв, але десь це може знадобитись
            return true;
        }
    }
    // Якщо з emil все ок
    return false;
}


// Додаткова валідація регулярним виразом
// Грубо первіряє на коректність конструкції
// Не дозволяє кирилицю
function validateEmail(email) {
    let re = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,12}$/;
    return re.test(email);
}




// cannot contain an underdash "_" in the address
function tireStop(domainOnly, localPart) {
    if (
        (domainOnly.indexOf('yandex') != -1) &&
        (localPart.indexOf('_') != -1)
    ) {
        return true;
    }
    return false;
}

// Якщо Ваші листи не можливо доставити на якісь домени, або ви НЕ хочете доставляти на них
// можна недопускати вказання юзерами цих email
function neNa(domainAll) {
    if (domainAll == 'my.com') {
        return 'my.com';
    }
    if (domainAll == 'rambler.ua') {
        return 'rambler.ua';
    }
    return false;
}



// email які починаються з номерів телефонів в яндексі є синонімами основних ящиків
// Тож в ідеалі треба забороняти використовувати yandex email що починаються з телефонів
// І вимагати вказання кореневого email
function yaPhone(epart) {
    // Перевіряємо, чи містить домен "yandex" або "ya.ru"
    if (/yandex|ya\.ru/.test(epart['domainAll'])) {
        const phoneCodes = [
            /^380/, // Україна
            /^37/,  // Білорусь, Молдова, Латвія, Вірменія
            /^99/,  // Грузія, Киргизстан, Таджикистан, Узбекистан
            /^79/,  // РФ
            /^89/,  // РФ
            /^77/   // Казахстан
        ];

        // Якщо локальна частина починається з телефонного коду і містить тільки цифри
        if (phoneCodes.some(code => code.test(epart['localPart'])) && /^\d{11,13}$/.test(epart['localPart'])) {
            return true;
        }
    }
    return false;
}





// Намагаємось привести email до його кореневого стерильного стану
function buildStandartEmail(email) {

    // За замовчуванням так і запишемо якщо нічого не змінимо
    let StandartEmail = email;
    // Конвертуємо всі можливі варіації Яндекс ящиків в еталонний формат mail.mail@yandex.ru
    // Не найкраще рішення використовувати .[a-z]{2,3} але зато коротко
    if (/@(?:yandex\.[a-z]{2,3}|ya\.ru|narod\.ru)$/i.test(email)) {
        const [box, domain] = email.split('@');
        StandartEmail = box.replace(/-/g, '.') + '@yandex.ru';
    }
    // Конвертуємо всі можливі варіації ГУГЛ ящиків на еталонний формат mailmail@gmail.com
    if (/@(gmail\.com|googlemail\.com)$/i.test(email)) {
        const [box, domain] = email.split('@');
        StandartEmail = box.replace(/\./g, '') + '@gmail.com';
    }
    // Конвертуємо всі можливі варіації ProtonMail ящиків на еталонний формат box@proton.me
    if (/@(pm\.me|proton\.me|protonmail\.com)$/i.test(email)) {
        const [box, domain] = email.split('@');
        StandartEmail = box.replace(/\./g, '') + '@proton.me';
    }
    // ВИдаляємо точки в icloud
    if (/@(icloud\.com)$/i.test(email)) {
        const [box, domain] = email.split('@');
        StandartEmail = box.replace(/\./g, '') + '@icloud.com';
    }
    // Конвертуємо yahoo
    if (/@(ymail\.com)$/i.test(email)) {
        const [box, domain] = email.split('@');
        StandartEmail = box + '@yahoo.com';
    }

    return StandartEmail;
}


// Виявляємо чи використовує юзер анонімайзер, тобто тимчасову, однохвилину пошту
function stopAnonimayzer(domainAll) {
    let anonimayzer = [
        // УВАГА!!! Всі домени та зони нижче потрібно вводити в нижньому регістрі
        // Перелічимо які хочемо анонімайзери через кому
        'scryptmail.com'
    ]
    for (let cx = 0; cx < anonimayzer.length; cx++) {
        if (anonimayzer[cx] == domainAll) {
            return true; // Помилка
        }
    }
    return false;
}

// Виправляємо помилкову зону на коректну
function correctDomainZone(domainZone) {
    const corrections = {
        // Всі ці помилки засновані на реальному досвіді
        'ru': ['ry', 'rv', 'ri', 'rn', 'tu', 'ty', 'my'],
        'com': ['cjm', 'cpm', 'kom', 'gom', 'vom', 'con', 'kon', 'cm', 'om', 'cim', 'som', 'xom', 'cox'],
        'org': ['orq', 'opq', 'opg'],
        'ua': ['ya'],
        'net': ['ner', 'het', 'bet', 'nen', 'nit', 'met', 'ney', 'ne', 'nwt']
    };

    for (let correctZone in corrections) {
        if (corrections[correctZone].includes(domainZone)) {
            return correctZone;
        }
    }

    return domainZone; // Повертає початкову зону, якщо вона не знайдена серед помилкових
}

// Достовірно помилкові домени що виправляються автоматично на коректні
// Найпоширеніші друкарські помилки
// ! ЧЕРЕЗ СПЕЦИФІКИ ПЕРЕВІРКИ ДОМЕНУ (за входженням на початку), сюди не варто включати варіант на кшталт
// ! 'gmai','gma', -- бо буде робити даремну заміну шила на шило
function correctName(domainOnly) {
    const corrections = {
        'yandex': ['yandax', 'yandeks', 'yandx', 'yangex', 'jandex', 'yadex', 'uandex', 'yndex', 'ayndex'],
        'bigmir': ['digmir', 'biqmir', 'diqmir'],
        'mail': [
            'mfil', 'meil', 'msil', 'maij', 'maill', 'mil', 'imeil', 'mael', 'maii', 'mali', 'mal', 'majl', 'maul',
            'masl', 'maik', 'ail', 'naul', 'nail'
        ],
        'icloud': ['icloud', 'cloud', 'ikloud', 'iclout', 'icloub', 'cloub'],
        // GMAIL.COM та ім'я йому ЛЕГІОН
        'gmail': [
            'gamailcom', 'gmaill', 'gmailco', 'gmel', 'qm', 'gmjl', 'gmm', 'gmaa', 'ggmai', 'cmal', 'cail', 'gail',
            'gmal', 'gmei', 'gmaij', 'gmajl', 'qnail', 'gnail', 'gmeil', 'gmall', 'jmail', 'gmaii', 'gmali', 'hmail',
            'gmael', 'jimal', 'jmeil', 'qhail', 'gmoil', 'ghail', 'cmail', 'gamil', 'dmail', 'gmaik', 'gmоil', 'gimajl',
            'gimail', 'qemail', 'gomail', 'gemeil', 'gemail', 'gamail', 'gameil', 'gmaul', 'qeimal', 'glail', 'gmaile',
            'goi', 'qoi', 'gmfql', 'gmd'
        ]
    };

    for (let correctName in corrections) {
        if (corrections[correctName].includes(domainOnly)) {
            return correctName;
        }
    }

    return domainOnly;
}


// Не даємо клієнту вказувати email на перелічених нижче доменах та зонах
// Здебільшого це неймовірно тупі помилки
// Дєякі помилки можна було б виправляти автоматично, але ми ітак багато помилок виправляємо автоматично і це вже нюанси
function stopDomainALL(epart) {
    let email_not_valid = [
        // УВАГА!!! Всі домени та зони нижче потрібно вводити в нижньому регістрі
        'com.ua', 'ua.com', 'kom.ua', 'kis.ru', 'kom.ru', 'com.ru', 'ru.com', 'meil.com', 'mael.com', 'emeil.ru', 'emeil.com', 'imeil.ua', 'com.com',
        'net.ua', 'net.ru', 'com.net', 'example.com', 'sitemail.com', 'site.com', 'email.com', 'mailcom.ru',

        // Разные мелкачи типа yahoo rambler hotmail яблоки icloud и т.п.  и связанные с ними опечатки
        'yahoo.net', 'hotmail.ru', 'ramler.ru', 'ramdler.ru', 'rambler.com', 'yaho.com',
        // Популярные украинские почтовики
        'ua.net', 'ykr.net', 'ykt.net', 'ukt.net', 'ucr.net', 'ukr.com',

        'bigmir.ua', 'bigmir.com',

        // Осторожней с этим GMAIL
        'gmail.ru', 'gmail.ua', 'gmail.com.ua', 'gmail.com.ru',

        // YANDEX 
        'ya.ua', 'ya.com',
        'yande.ru', 'yande.ua',

        // MAIL.RU и вся их орда
        'inboks.ru', 'indox.ru',
        'list.ua', 'list.com', 'iist.ru', 'iist.ua',
        'bk.com', 'bk.ua', 'dk.com', 'br.com', 'dk.ru', 'br.ru', 'bl.ru', 'bj.ru',
        'vk.ru', 'vk.com', 'vkontakte.ru',
        'mail.com', 'mail.com.ua', 'mail.com.ru',
    ];



    let domain_not_valid = [
        // Зони які точно не вірні і які неможливо розібрати
        'yy', 'aa'
    ];


    for (let cx = 0; cx < email_not_valid.length; cx++) {
        if (email_not_valid[cx] == epart.domainAll) {
            return true; // Помилка
        }
    }
    for (let cx = 0; cx < domain_not_valid.length; cx++) {
        if (epart.domainZone == domain_not_valid[cx]) {
            return true; // Помилка
        }
    }


    return false;
}

// доменное имя не может быть из одной буквы, за исключением I.UA и A.UA, 
// другие же любые международные сервисы которые мыслимыми способами могут использоваться(типа x.com) это ошибка
function oneLetter(domainAll) {
    if (domainAll != undefined) {
        if (domainAll.indexOf('i.ua') == -1 && domainAll.indexOf('a.ua') == -1) {
            let split_email = domainAll.split('.');
            if (split_email[0].length == 1)
                return true;
        }
    }
    return false
}


// Якщо домена зона складається більше ніж з 5 букв, то це помилка
// Спірне рішення, бо корпоративні пошти можуть були усілякі - .place наприклад
function domainZoneLenght(domainZone) {
    if (domainZone.length > 5) { // 3 - якшо ресурс не розрахований під корпоративних клієнтів
        return true;
    }
    return false
}

// Якщо домена зона - є в цьому переліку, то повертаємо помилку
function badZone(domainZone) {
    if (domainZone == 'xxx' || domainZone == 'biz' || domainZone == 'cc') {
        return true;
    }
    return false
}


// Інтелектуальні правила складені з урахуванням нюансів формування мила в деяких поштовиків. 
// Дозволяють зменшити кількість явних друкарських помилок та адрес введених на дурня
// Мінімальна довжина для деяких поштових скриньок
function minLength(epart) {
    const domainRules = {
        'i.ua': 6,
        'ro.ru': 6,
        'r0.ru': 6,
        'rambler.ru': 6,
        'lenta.ru': 6,
        'myrambler.ru': 6,
        'gmail.com': 5,
        'mail.ru': 3,
        'mail.ua': 3,
        'inbox.ru': 3,
        'list.ru': 3,
        'bk.ru': 3
    };
    const minLength = domainRules[epart.domainAll] !== undefined ? domainRules[epart.domainAll] : 3;
    return epart.localPart.length < minLength;
}



// Інші перевірки всі на купу поки що
function sintaksisValid(epart) {

    // Перелік поштовиків які ТОЧНО не допускають два "символи", що йдуть один за одним
    const restrictedDomains = ['ya.ru', 'yandex', 'mail.ru', 'bk.ru', 'mail.ua', 'inbox.ru', 'gmail.com', 'list.ru'];
    const invalidPatterns = ['..', '-.', '.-', '_.', '._', '--', '-_', '_-', '__'];

    if (
        restrictedDomains.some(domain => epart.domainAll.includes(domain)) &&
        invalidPatterns.some(pattern => epart.localPart.includes(pattern))
    ) {
        return true;
    }


    if (epart.localPart[0] != undefined) {
        // Мило не може починатися з наступних символів у жодної з поштовиків
        if (
            epart.localPart[0].indexOf('.') != -1 ||
            epart.localPart[0].indexOf('-') != -1 ||
            epart.localPart[0].indexOf('_') != -1
        )
            return true;

        // Мило  безпосередньо перед собачкою не може містити наступні символи в жодної з поштовиків
        if (
            epart.localPart[epart.localPart.length - 1].indexOf('.') != -1 ||
            epart.localPart[epart.localPart.length - 1].indexOf('-') != -1 ||
            epart.localPart[epart.localPart.length - 1].indexOf('_') != -1
        )
            return true;
    }



    // Якщо домен 4-го та вище рівнів - повертаємо помилку
    let email_array = epart.domainAll.split('.');
    if (email_array.length > 3) {
        return true;
    }

    // Якщо в доменій зоні є цифри
    let ext = email_array[email_array.length - 1];
    if (/\d/.test(ext)) {
        return true
    }

    return false;
}