<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Видеотелефон</title>
        <link href="css/styles.css" type="text/css" rel="stylesheet">
    </head>
    <body>
        <section id="login">
            <form id="genderForm">

                <select id="gender">
                    <option value="">Выберите ваш пол</option>
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                </select>             
                <input type="submit" id="btnLogin" value="Принять" disabled>
            </form>
        </section>
        <section id="invite" style="display: none;">
            <p>Вы подключились под именем <strong id="username1"></strong></p>
            <form id="frmInvite">
                <label for="lstUsers">Абонент</label>
                <select id="lstUsers" size="10" disabled></select>
                <input type="submit" id="btnInvite" value="Связаться" disabled>
            </form>
            <p>&nbsp;</p>
            <input type="button" id="btnLogout" value="Выход">
        </section>
        <section id="calling" style="display: none;">
            <p>Вы подключились под именем <strong id="username2"></strong></p>
            <p>Вызывается пользователь <strong id="touser1"></strong></p>
            <input type="button" id="btnCancel1" value="Отменить вызов">
        </section>
        <section id="called" style="display: none;">
            <p>Вы подключились под именем <strong id="username3"></strong></p>
            <p>Вас вызывает абонент <strong id="touser2"></strong></p>
            <input type="button" id="btnAgree" value="Принять вызов">
            <p>&nbsp;</p>
            <input type="button" id="btnDecline" value="Отменить вызов">
        </section>
        <section id="phone" style="display: none;">
            <p>Вы подключились под именем <strong id="username4"></strong></p>
            <p>Вы разговариваете с абонентом <strong id="touser3"></strong></p>
            <div id="cont_remote">
                <video id="video_remote" autoplay></video>
                <div id="cont_local">
                    <video id="video_local" muted autoplay></video>
                </div>
            </div>
            <input type="button" id="btnCancel2" value="Завершить звонок">
            <p>&nbsp;</p>
            <div id="messages">
            </div>
            <p>&nbsp;</p>
            <form id="frmChat">
                <label for="txtMessage">Текст сообщения</label>
                <textarea id="txtMessage"></textarea>
                <label for="txtFile">Файл</label>
                <input type="file" id="txtFile">
                <input type="submit" id="btnSend" value="Отправить">
            </form>
        </section>
         
        <script src="js/iceservers.js" type="text/javascript"></script>
        <script src="js/main.js" type="text/javascript"></script>
        <script src="https://webrtc.github.io/adapter/adapter-latest.js" type="text/javascript"></script>
        
    </body>
</html>