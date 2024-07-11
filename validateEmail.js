// Скрипт може проводити валидацію email та показувати СТАНДАРТИЗОВАНІ помилки
// Чіпляємо цей js на сторінку між jquery та вашою бібліотекою що валідує форму та виводить повідомлення про помилки
// Викликаємо функцію перевірки testEmail();
// Функція вже вміє видавати, та приховувати типові помилки
// Якщо відповідні блоки додані на сторінку
// Щоб юзер міг бачити суть проблеми
// Вони мають містити .errormail та класс з ім'ям що в sendError();
// https://github.com/uwayit/validate-email-full-jquery

// Ховаемо всі повідомлення про помилки в email
$('.email').bind('change keypress keydown keyup', function () {
    $(this).removeClass('error');
    $('.errormail').hide();
    // Знімаємо блокування кнопки
    $('.testEmailButton').prop('disabled', false);
    $('.testEmailButton').removeClass('disbtn');
});

// Запускаємо перевірку поля з email
function testEmail(emailObj) {
    // Блокуємо кнопку на період аналізу
    // Блокування кнопки знімається автоматично якщо все окей і НЕ знімається якщо є помилка
    $('.testEmailButton').prop('disabled', true);
    $('.testEmailButton').addClass('disbtn');

    // Берем з об'єкту email
    let email = $(emailObj).val();

    // Чистимо мило від УСІХ пробілів та плюсу на початку
    // приводимо до нижнього регістру
    email = initialPreparation(email);

    // Згладжуємо можливі баги в тому числі баги placeholder etc
    if (!email || email === 'email') {
        $(emailObj).val('');
        $(emailObj).addClass('error');
        return false;
    }

    // Тихо видаляємо www в мильнику, бо то явно помилка і йдемо далі
    // АЛЕ
    // Краще насправді не видаляти і не йти далі, а просити клієнта все перевірити і виправити помилки самостійно
    // Бо кліент вірогідно дуже погано розуміє що таке email і де його взяти
    // Отож статистично, якщо він вводить email починаючи з www то там неправильно не тільки це, а взагалі все введено від балди
    // Тож я просто видаляю www, а ви можете наприклад видати помилку (приклади виводу помилок вище)
    let www = email.split('www.');
    if (www.length > 1) {
        email = www.join('');
    }

    // Перевірка та мовчазне непомітне для клієнта виправлення найбільш типових та явних друкарських помилок у мильниках
    email = email.replace('yandex.com.ua', 'yandex.ua');
    email = email.replace('gmail.com.ua', 'gmail.com');

    // Після видалення www
    // Деперсоналізуємо email видаляючи з нього додаткові фільтруючі патерни
    // myemail+work@gmail.com = myemail@gmail.com
    email = clearPlus(email);

    // Розбираємо email на частини
    let epart = {};
    // Якщо точка є, то тут буде кількість символів до точки
    epart['lastPoint'] = email.lastIndexOf('.');
    // Якщо собачка є, то тут буде кількість символів до собачки
    epart['lastAt'] = email.lastIndexOf('@'); 
    epart['domainZone'] = email.slice(epart['lastPoint'] + 1);  // com
    epart['localPart'] = email.slice(0, epart['lastAt']);   // все до собачки
    epart['domainAll'] = email.slice(epart['lastAt'] + 1); // gmail.com
    epart['domainOnly'] = email.slice(epart['lastAt'] + 1, epart['lastPoint']); // gmail

    // Оголошуємо всі перевірки
    let numberT = false
    let isLieT = false
    let grubo = false
    let stopAnonimayzerT = false
    let yaphoneTest = false
    let tireStopTest = false
    let neNaTest = false

    // Будь який рядок з непотрібною функціїю НИЖЧЕ можна закоментувати, наприклад
    // numberTest = numberTest(epart['domainAll'], emailObj);
    // і тоді дія/заміна/перевірка яку виконує функція - просто пропускатиметься

    // Перевіряємо на цифри у доменному імені
    // Вирішили що ми не прийматимемо заявку якщо в домені мила клієнта є хоч одна цифра,
    // так як відсоток реальних заявок із цифрами в домені близький до нуля
    // а ось друкарських помилок на зразок vova@1999mail.ru безліч. Як їм це вдається - я не знаю
    // Тому тут навіть видалення цифр не допоможе, бо email точно буде некоректним,
    // а отже просимо користувача виправити помилку
    numberT = numberTest(epart.domainAll);
    if (numberT) {
        // Виводимо помилку numberTest
        sendError(emailObj, 'numberTest');
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
    stopAnonimayzerT = stopAnonimayzer(epart.domainAll);
    if (stopAnonimayzerT) {
        // Якщо це взагалі нахабство, то можна брати його IP чи fingerprint та відправляти в стоп ліст
        // щоб забанити і ускладнити йому можливість подати заявку
        // Я цього не робив і просто повідомляю юзеру про те, що тимчасові пошти використовувати заборонено
        sendError(emailObj, 'stopAnonimayzerTest');
        return false;
    }



    // Перевіряємо синтаксис імені
    let newte = isEmailValid(email);
    if (newte == false) {
        sendError(emailObj, 'newte');
        return false;
    }

    // Не даємо клієнту вказувати ящики на перелічених нижче доменах та доменних зонах
    // Здебільшого це захист від помилкового введення того що після собачки
    let newtestZone = testZone(email);
    if (newtestZone == false) {
        sendError(emailObj, 'newtestZone');
        return false;
    }



    // Приводимо всі синоніми до кореневого вигляду
    email = buildStandartEmail(email);

    // email які починаються з номерів телефонів в яндексі є синонімами основних ящиків
    // Тож в ідеалі треба забороняти використовувати yandex email що починаються з телефонів 
    // І вимагати вказання кореневого email
    // Я не використовую цю перевірку, бо не працюю на сосії
    // yaphoneTest = yaPhone(email);
    if (yaphoneTest) {
        sendError(emailObj, 'yaphoneTest');
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

    return email;

}


// Пушимо користувачу повідомлення про помилку
function sendError(emailObj, error) {
    console.log(error);
    $('.' + error).show();
    $(emailObj).addClass('error');
    return true;
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

// если плюс в середине мыла: Тихо удаляет знак плюс "+" и всё что после него до собачки
// Позволяет деперсонализовать ввод email
function clearPlus(email) {
    let pos_plus = email.lastIndexOf('+');
    if (pos_plus > 0) {
        return email.substring(0, pos_plus) + email.substring(email.indexOf('@'));
    }
    return email;
}

// Перевіряємо на наявність цифри в домені
function numberTest(domainAll) {
    return /\d/.test(domainAll);
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
    if (epart['domainOnly'].includes('yandex') || epart['domainOnly'].includes('ya.ru')) {
        // Перевіряємо відповідність телефонним кодам країн
        const phoneCodes = [
            /^380/, // Україна
            /^37/,  // Білорусь, Молдова, Латвія, Вірменія
            /^99/,  // Грузія, Киргизстан, Таджикистан, Узбекистан
            /^79/,  // РФ
            /^89/,  // РФ
            /^371/, // Латвія
            /^77/   // Казахстан
        ];
        // Якщо локальна частина починається з телефонного коду і містить тільки цифри
        if (phoneCodes.some(code => code.test(epart['localPart'])) && /^\d{11,13}$/.test(epart['localPart'])) {
            return true;
        }
    }
    return false;
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


// Валідація регулярним виразом
function validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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


// Якщо юзер використовує анонімайзер, тобто тимчасову, однохвилину пошту
function stopAnonimayzer(domainAll) {
    return false;
}


// Не даём клиенту указывать ящики на перечисленных ниже доменах и доменных зонах
function testZone(email) {
    let email_not_valid = [
        // ВНИМАНИЕ!!! Все ящики здесь нужно вводить в нижнем регистре.
        // Популярные в Украине анонимайзеры почты
        '@scryptmail.com',
        // ошибочные или абсолютно левые домены. Это как правило опечатки или попытки указать хоть что-то "дабы пропустило" из-за неимения личного мыла
        '@com.ua', '@ua.com', '@kom.ua', '@kis.ru', '@kom.ru', '@com.ru', '@ru.com', '@meil.com', '@mael.com', '@emeil.ru', '@emeil.com', '@imeil.ua', '@com.com',
        '@net.ua', '@net.ru', '@com.net', '@example.com', '@sitemail.com', '@site.com', '@email.com', '@mailcom.ru',
        // Разные мелкачи типа yahoo rambler hotmail яблоки icloud и т.п.  и связанные с ними опечатки
        '@yahoo.net', '@hotmail.ru', '@ramler.ru', '@ramdler.ru', '@rambler.com', '@yaho.com',
        // Айфоны
        '@icloud.ru', '@cloud.com', '@cloud.ru', '@ikloud.com', '@ikloud.ru', '@iclout.com', '@iclou.com', '@icloub.com', '@cloub.com',
        // Популярные украинские почтовики
        '@ua.net', '@ykr.net', '@ykt.net', '@ukt.net', '@ucr.net', '@ukr.com',
        '@digmir.net', '@biqmir.net', '@diqmir.net', '@bigmir.ua', '@bigmir.com',

        // Осторожней с этим GMAIL
        '@gmail.ru', '@gmail.ua', '@gmail.com.ua', '@gmail.com.ru',

        // YANDEX 
        '@ya.ua', '@ya.com',
        '@yadex.ru', '@yadex.ua',
        '@yndex.ru', '@yndex.ua',
        '@uandex.ru', '@uandex.ua',
        '@yande.ru', '@yande.ua',
        '@ayndex.ru', '@ayndex.ua',

        // MAIL.RU и вся их орда
        '@inboks.ru', '@indox.ru',
        '@list.ua', '@list.com', '@iist.ru', '@iist.ua',
        '@bk.com', '@bk.ua', '@dk.com', '@br.com', '@dk.ru', '@br.ru', '@bl.ru', '@bj.ru',
        '@vk.ru', '@vk.com', '@vkontakte.ru',
        '@mail.com', '@mail.com.ua', '@mail.com.ru',
        '@mfil.ru', '@mfil.ua',
        '@meil.ru', '@meil.ua',
        '@msil.ru', '@msil.ua',
        '@maij.ru', '@maij.ua',
        '@maill.ru', '@maill.ua',
        '@mil.ru', '@mil.ua',
        '@imeil.ru', '@imeil.ua',
        '@mael.ru', '@mael.ua',
        '@maii.ru', '@maii.ua',
        '@mai.ru', '@mai.ua',
        '@mali.ru', '@mali.ua',
        '@mal.ru', '@mal.ua',
        '@majl.ru', '@majl.ua',
        '@maul.ru', '@maul.ua',
        '@masl.ru', '@masl.ua',
        '@maik.ru', '@maik.ua',
        '@ail.ru', '@ail.ua',
        '@naul.ru', '@naul.ua',
        '@nail.ru', '@nail.ua'

    ];
    let from = email.search('@');
    let to = email.length;
    let new_email = email.substring(from, to);
    let domain_not_valid = [
        // достоверно ошибочные зоны. Самые распространённые опечатки позволяющие значительно уменьшить ассортимент вариаций выше
        // Пиздец, да? Это же (И ВСЕ ВАРИАНТЫ ВЫШЕ В ДОМЕНАХ) не из воздуха придуманы, а так сказать основаны на реальных событиях... Выдают же люди перлы...
        '.ry', '.rv', '.ri', '.rn', '.tu', '.ty', '.my',
        '.cjm', '.cpm', '.kom', '.gom', '.vom', '.con', '.kon', '.cm', '.om', '.cim', '.som', '.xom', '.cox',

        '.orq', '.opq', '.opg',
        '.ya',
        '.us', // Знаю что домен американский, но у меня американских клиентов нет, а вот Украинцы с большими, толстыми пальцами промахиваются....
        '.ner', '.het', '.bet', '.nen', '.nit', '.met', '.ney', '.ne', '.nwt'];

    let domain_name_not_valid = [
        // достоверно ошибочные домены. Самые распространённые опечатки позволяющие значительно уменьшить ассортимент вариаций выше
        '@cal', '@yandax', '@yandeks', '@yandx', '@yangex', '@jandex',
        // GMAIL.COM та ім'я йому ЛЕГІОН
        // ИЗ-ЗА СПЕЦИФИКИ ПРОВЕРКИ ДОМЕНА (по вхождению), сюда нельзя включать вариант вроде
        // ! '@gmai','@gma', -- бо тоді на gmail.com буде казати, що невірний домен!
        '@gamailcom', '@gmaill', '@gmailcom', '@gmel', '@qm', '@gmjl', '@gmm', '@gmaa', '@ggmai', '@cmal', '@cail', '@gail', '@gmal', '@gmei',
        '@gmaij', '@gmajl', '@qnail', '@gnail', '@gmeil', '@gmall', '@jmail', '@gmaii', '@gmali', '@hmail', '@gmael', '@jimal', '@jmeil', '@qhail',
        '@gmoil', '@ghail', '@cmail', '@gamil', '@dmail', '@gmaik', '@gmоil', '@gimajl', '@gimail', '@qemail', '@gomail', '@gemeil', '@gemail',
        '@gamail', '@gameil', '@gmaul', '@qeimal', '@glail', '@gmaile', '@goi', '@qoi', '@gmfql', '@gmd'];


    for (let cx = 0; cx < email_not_valid.length; cx++) {
        if (email_not_valid[cx] == new_email) {
            return false;
        }
    }
    for (let cx = 0; cx < domain_not_valid.length; cx++) {
        from = to - domain_not_valid[cx].length;
        let email_domain = email.substring(from, to);
        if (email_domain == domain_not_valid[cx]) {
            return false;
        }
    }

    for (let cx = 0; cx < domain_name_not_valid.length; cx++) {
        if (email.indexOf(domain_name_not_valid[cx]) !== -1) {
            return false;
        }
    }
    return true;
}


function isEmailValid(email) {

    // Находим последнюю точку в указанном клиентом мыльнике
    let last_point = email.lastIndexOf('.');
    // Находим последнюю собачку в указанном клиентом мыльнике
    let last_sobaka = email.lastIndexOf('@');
    // Берём доменную зону мыльника клиента в формате .com
    let domain_zone = email.substr(last_point);
    // Берём кусок мыла клиента от начала и до последней имеющейся в нём собачки
    let l_email = email.substr(0, last_sobaka);
    // Берём доменное имя мыльника example.comm
    let r_email = email.substr(+last_sobaka + 1);


    // Интелектуальные правила составленные на основе нюансов формирования мыла у некоторых почтовиков. Позволяют уменьшить количество явных опечаток и адресов введённых на дурака
    // Минимальная длина маила для некторых почтовых ящиков
    if (r_email.indexOf('i.ua') != -1 && l_email.length < 6)
        return false;
    if (r_email.indexOf('ro.ru') != -1 && l_email.length < 6)
        return false;
    if (r_email.indexOf('r0.ru') != -1 && l_email.length < 6)
        return false;
    if (r_email.indexOf('rambler.ru') != -1 && l_email.length < 6)
        return false;
    if (r_email.indexOf('lenta.ru') != -1 && l_email.length < 6)
        return false;
    if (r_email.indexOf('myrambler.ru') != -1 && l_email.length < 6)
        return false;
    // У гугла минималка сейчас 6 (но неизвестно как было раньше) без точек и тире
    if (r_email.indexOf('gmail.com') != -1 && l_email.length < 5)
        return false;
    if (r_email.indexOf('mail.ru') != -1 && l_email.length < 3)
        return false;
    if (r_email.indexOf('mail.ua') != -1 && l_email.length < 3)
        return false;
    if (r_email.indexOf('inbox.ru') != -1 && l_email.length < 3)
        return false;
    if (r_email.indexOf('list.ru') != -1 && l_email.length < 3)
        return false;
    if (r_email.indexOf('bk.ru') != -1 && l_email.length < 3)
        return false;

    // Перечень почтовиков которые ТОЧНО не допускают два "символа" в адресе идующих друг за другом
    if (
        (
            r_email.indexOf('ya.ru') != -1 ||
            r_email.indexOf('yandex') != -1 ||
            r_email.indexOf('mail.ru') != -1 ||
            r_email.indexOf('bk.ru') != -1 ||
            r_email.indexOf('mail.ua') != -1 ||
            r_email.indexOf('inbox.ru') != -1 ||
            r_email.indexOf('gmail.com') != -1 ||
            r_email.indexOf('list.ru') != -1
        ) &&
        (
            l_email.indexOf('..') != -1 ||
            l_email.indexOf('-.') != -1 ||
            l_email.indexOf('.-') != -1 ||
            l_email.indexOf('_.') != -1 ||
            l_email.indexOf('._') != -1 ||
            l_email.indexOf('--') != -1 ||
            l_email.indexOf('-_') != -1 ||
            l_email.indexOf('_-') != -1 ||
            l_email.indexOf('__') != -1
        )
    )
        return false;


    // доменное имя не может быть из одной буквы, за исключением I.UA и A.UA, другие же любые международные сервисы которые мыслимыми способами могут использоваться (типа x.com) это ошибка
    if (r_email != undefined) {
        if (r_email.indexOf('i.ua') == -1 && r_email.indexOf('a.ua') == -1) {
            let split_email = r_email.split('.');
            if (split_email[0].length == 1)
                return false;
        }
    }



    if (l_email[0] != undefined) {
        // Мыло не может начинаться со следующие символов ни у одного из почтовиков
        if (
            l_email[0].indexOf('.') != -1 ||
            l_email[0].indexOf('-') != -1 ||
            l_email[0].indexOf('_') != -1
        )
            return false;

        // Мыло не может заканчиваться (перед собачкой, да и в принципе кстати) на следующие символы ни у одного из почтовиков
        if (
            l_email[l_email.length - 1].indexOf('.') != -1 ||
            l_email[l_email.length - 1].indexOf('-') != -1 ||
            l_email[l_email.length - 1].indexOf('_') != -1
        )
            return false;
    }



    // Если доменная зона состоит больше чем из 4 букв возвращаем ошибку
    if (domain_zone.length > 4)
        return false;




    // Если домен клиента один из ниже перечисленных, то возвращаем ошибку
    if (domain_zone == '.xxx' || domain_zone == '.biz' || domain_zone == '.cc')
        return false;



    // Если домен мыла клиента является доменом 4-го и выше уровней то возвращаем ошибку
    let email_array = r_email.split('.');
    if (email_array.length > 3) {
        return false;
    }

    let ext = email_array[email_array.length - 1];

    if (ext.length > 4 || /\d/.test(ext)) {
        return false
    }
    return true;
}