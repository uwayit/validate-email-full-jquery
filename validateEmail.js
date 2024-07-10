// Скрипт може проводити валидацію email та показувати СТАНДАРТИЗОВАНІ помилки
// Дуже бажано щоб більше ніяких перевірок на це поле не накладалось
// Чіпляємо цей js на сторінку між jquery та вашою бібліотекою що валідує форму та виводить повідомлення про помилки
// Викликаємо функцію перевірки testEmail();
// Функція вже вміє видавати, та приховувати типові помилки
// Якщо вони додані на сторінку
// Приклад роботи на ../cab/

// Ховаемо всі повідомлення про помилки в email
$('.email').bind('change keypress keydown keyup', function () {
    $(this).removeClass('error');
    $('.errormail').hide();
    // Знімаємо блокування кнопки
});

// Запускаємо перевірку поля з email
function testEmail(emailObj) {
    // Блокуємо кнопку на період аналізу
    // Блокування кнопки знімається автоматично якщо все окей і НЕ знімається якщо є помилка
    $('.testEmailButton').prop('disabled', true);
    $('.testEmailButton').addClass('disbtn');

    // Який класс додаватимемо полю email у випадку якщо виникла помилка
    let errorClass = 'error';

    // Берем з об'єкту email
    let email = $(emailObj).val();

    // понижуємо регістр
    email = email.toLowerCase();

    // Чистимо мило від УСІХ пробілів та плюсів на початку мила
    email = deleteSpaсeAndPlus(email);

    // Виправляємо можливі баги placeholder etc
    if (email == 'email') {
        $(emailObj).val('');
        $(emailObj).addClass('error');
        return false;
    }

    // Невідома помилка
    if (email == false) {
        $(emailObj).val('');
        $(emailObj).addClass('error');
        return false;
    }
    $(emailObj).val(email);

    // Тихо видаляємо www в мильнику, бо то явно помилка і йдемо далі
    // АЛЕ
    // Краще насправді не видаляти і не йти далі, а просити клієнта все перевірити і виправити помилки самостійно
    // Бо кліент вірогідно дуже погано розуміє що таке email і де його взяти
    // Отож статистично, якщо він вводить email починаючи з www то там неправильно не тільки це, а взагалі все введено від балди
    // Тож я просто видаляю www, а ви можете наприклад видати помилку (приклади виводу помилок вище)
    let www = email.split('www.');
    if (www.length > 1) {
        email = www.join('');
        $(emailObj).val(email);
    }


    // Перевірка та мовчазне непомітне для клієнта виправлення найбільш типових та явних друкарських помилок у мильниках
    $(emailObj).val($(emailObj).val().replace('yandex.com.ua', 'yandex.ua'));
    $(emailObj).val($(emailObj).val().replace('gmail.com.ua', 'gmail.com'));

    email = $(emailObj).val();

    // Деперсоналізуємо email видаляючи з нього додаткові фільтруючі патерни
    // myemail+work@gmail.com = myemail@gmail.com
    email = clearPlus(email);
    if (email == false) {
        $(emailObj).addClass('error');
        return false;
    }
    
    $(emailObj).val(email);



    // Якась стара історія
    // Здається яндекс ящики не можуть містити номер телефона
    // Або власник якогось сайту не хтів приймати такі заявки
    // Наразі не використовую
    let yaphone = true;
    // let yaphone = isEmailValidByFnone(email);
    if (yaphone == false) {
        let err = 'yaphone';
        //console.log(err);
        $('.' + err).show();
        $(emailObj).addClass('error');
        return false;
    }

    // Перевіряємо, чи не використовує клієнт точно ЛЄВОЄ мило
    let nonoe = isEmailValidyou(email);
    if (nonoe == false) {
        let err = 'nonoe';
        //console.log(err);
        $('.' + err).show();
        $(emailObj).addClass('error');
        return false;
    }

    // Груба перевірка email
    // Але там такий якась складна регулярка
    // ну принаймні вона пускає тіко латинські домени
    let grubo = validateEmail(email);
    if (!grubo) {
        let err = 'validateEmail';
        //console.log(err);
        $('.' + err).show();
        $(emailObj).addClass('error');
        return false;
    }

    // Перевіряємо здебільшого синтаксис імені
    let newte = isEmailValid(email);
    if (newte == false) {
        let err = 'newte';
        //console.log(err);
        $('.' + err).show();
        $(emailObj).addClass('error');
        return false;
    }

    // Не даём клиенту указывать ящики на перечисленных ниже доменах и доменных зонах
    // Здебільшого це захист від помилкового введення того що після собачки
    let newtestZone = testZone(email);
    if (newtestZone == false) {
        let err = 'newtestZone';
        //console.log(err);
        $('.' + err).show();
        $(emailObj).addClass('error');
        return false;
    }

    // Якщо все окей, знімаємо блокування кнопки відправки форми
    $('.testEmailButton').prop('disabled', true);
    $('.testEmailButton').addClass('disbtn');

    return email;

}



// Тихо видаляє з поля з email УСІ пробіли та знак плюс "+" на початку мила
function deleteSpaсeAndPlus(from) {
    if (from) {
        from = from.replace(/\s+/g, '');
        if (from[0] == '+') {
            from = from.substr(1);
        }
    } 
        return from
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


// Валидация поля ЭМАИЛ
function isEmailValid(email) {

    if (email == '') { return false; }

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

    // Проверяем на цифры в доменном имени
    // Решили что мы не будем принимать заявку если в домене мыла клиента есть хоть одна цифра,
    // так как процент реальных заявок с цифрами в домене близок к нолю
    // а вот опечаток вроде vova@1999mail.ru огромное множество
    if (r_email.indexOf('0') >= 0) {
        return false;
    }
    if (r_email.indexOf('1') >= 0) {
        return false;
    }
    if (r_email.indexOf('2') >= 0) {
        return false;
    }
    if (r_email.indexOf('3') >= 0) {
        return false;
    }
    if (r_email.indexOf('4') >= 0) {
        return false;
    }
    if (r_email.indexOf('5') >= 0) {
        return false;
    }
    if (r_email.indexOf('6') >= 0) {
        return false;
    }
    if (r_email.indexOf('7') >= 0) {
        return false;
    }
    if (r_email.indexOf('8') >= 0) {
        return false;
    }
    if (r_email.indexOf('9') >= 0) {
        return false;
    }


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

    // Все вариации яндекс ящиков (@ya.ru, @yandex.net, @yandex.kz, @yandex.ua, @ yandex.ru, @yandex.com) не могут содержать нижний тире «_» в адресе
    if (
        (
            r_email.indexOf('ya.ru') != -1 ||
            r_email.indexOf('yandex') != -1
        ) &&
        (
            l_email.indexOf('_') != -1
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

// Якщо Ваші листи не можливо доставити на якісь домени, або ви НЕ хочете доставляти на них
// можна недопускати вказання юзерами цих email
function isEmailNotOn(email) {
    if (email == '') { return false; }
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

    if (r_email == 'my.com') {
        return 'my.com';
    }
    if (r_email == 'rambler.ua') {
        return 'rambler.ua';
    }
    return false;
}





// 
function isEmailValidByFnone(email) {
    // Только яндекс TODO: Яндекс ящики начинающиеся с номеров телефонов

    let last_point = email.lastIndexOf('.');
    let last_sobaka = email.lastIndexOf('@');
    let domain_zone = email.substr(last_point);
    let l_email = email.substr(0, last_sobaka);
    let r_email = email.substr(+last_sobaka + 1);


    if (r_email.indexOf('yandex') || r_email.indexOf('ya.ru')) {

        // Валидация email если содержит телефон
        // Фишка не страшная и прям уже контролировать всеобъмлюще ли она валидирует - не обязательно
        // С текущей скорость разработки - текущей валидации хватит до 2028 года
        if (
            // Украина
            /^380/.test(l_email) ||
            // Белоруссия, Молдова, Латвия, Армения
            /^37/.test(l_email) ||
            // Грузия, Киргизия, Таджикистан, Узбекистан
            /^99/.test(l_email) ||
            // РФ
            /^79/.test(l_email) ||
            /^89/.test(l_email) ||
            //
            /^371/.test(l_email) ||
            // Казахстан
            /^77/.test(l_email)
        ) {
            // Проверяем не состоит ли мыло до собачки только из цифр
            if (/[0-9]{11,13}/.test(l_email)) {
                return false;
            }
        }

    }

    return true;

}

// Не даём клиенту указывать откровенно лживые мыльники
function isEmailValidyou(email) {
    // Если клиент на сайте example.com подаёт заявку, то все ящики с домена @example.com нельзя использовать в качестве ящика.
    let doman_email = email.split('@');
    if (doman_email[1] == window.location.host || 'www.' + doman_email[1] == window.location.host) {
        return false
        // Вместе с отклонением мыла мы запоминаем факт попытки указания клиентом лживой информации и передаём эту информация на сервер вместе с заявкой
        // в разработке
    }
    let email_not_you = [
        // Откровенные неверные и/или лживые ящики
        // Достоверно извесно - таких не существует у клиентов
        // Сюди можна також внести нприклад наші email
        'mail@mail.ru', 'gmail@gmail.com', 'email@mail.ua'
    ];
    for (let cx = 0; cx < email_not_you.length; cx++) {
        if (email_not_you[cx] == email) {
            return false;
            // Вместе с отклонением мыла мы можем
            // запоминать факт попытки указания клиентом лживой информации 
            // и передаём эту информация на сервер вместе с заявкой
            // в розробці
        }
    }
    return true;
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
        '@icloud.ru', '@cloud.com', '@cloud.ru', '@ikloud.com', '@ikloud.ru', '@iclout.com', '@iclou.com', '@icloub.com', '@cloub.com', '@icloub.com',
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
            // Вместе с отклонением мыла мы запоминаем факт попытки указания клиентом лживой/ошибочной информации 
            // и передаём эти данные на сервер вместе с заявкой
            // попытки ввести ошибочный/лживый ИНН, фио и телефон точно нужно передавать на сервер, а вот насчёт мыла нужно покумекать, 
            // хотя лишним не будет как минимум для аналитики
            // в разработке
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
            // Вместе с отклонением мыла мы запоминаем факт попытки указания клиентом лживой/ошибочной информации 
            // и передаём эти данные на сервер вместе с заявкой
            // в разработке
        }
    }
    return true;
}

function validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}