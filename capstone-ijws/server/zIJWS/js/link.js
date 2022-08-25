const updateMessageLayout = () => {
    const startColor = $("#start-color").val(),
        endColor = $("#end-color").val(),
        fontColor = $("#font-color").val(),
        messageProxy = $("#message-area"),
        fontStyle = $("#font-style").val();


    $("#message-field").val(messageProxy.text());
    messageProxy.css('background', `linear-gradient(-45deg, ${startColor}, ${endColor})`);
    messageProxy.css('font-family', fontStyle);
    messageProxy.css('color', fontColor);

    const curPath = window.location.pathname.split("/");
    $("#link-id").val(curPath[curPath.length - 1]);
};

const validateMessage = () => {
    if ($("#message-field").val().length < 1) {
        let swalParams = {
            icon: "error",
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
        };
        swalParams.title = "Empty Message";
        swalParams.text = "Please enter a valid message.";
        Swal.fire(swalParams);
        return false;
    }
};

function escapeHTML(html_str) {
    'use strict';

    return html_str.replace(/[&<>"]/g, function (tag) {
        var chars_to_replace = {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"'
        };

        return chars_to_replace[tag] || tag;
    });
}

const load = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());

    $("#message-form").attr('action', `${location.protocol}//${location.host}/send-message?source=${escapeHTML(location.pathname)}`);

    if (params.success) {
        let swalParams = {
            icon: "success",
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
        };
        swalParams.title = "Sent!";
        swalParams.text = "Your message was sent! Send more message or create your own IJWS account.";
        Swal.fire(swalParams);
    }

    if (params.error) {
        let swalParams = {
            icon: "error",
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
        };
        swalParams.title = "Oops!";
        swalParams.text = `An error has occured: ${params.error}`;
        Swal.fire(swalParams);
    }

    fetch("/get-user-from-link?link=" + location.pathname.split("/")[location.pathname.split("/").length - 1]).then(
        response => {
            response.text().then(
                userJSON => {
                    const userObj = JSON.parse(userJSON);

                    $("#page-title").text(`I Just Wanna Say To ${userObj["first-name"]}...`);
                }
            );
        }
    );
};
