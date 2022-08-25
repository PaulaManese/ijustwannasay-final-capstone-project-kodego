const loadMessages = () => {
    fetch("/get-messages").then(
        response => {
            response.text().then(
                resText => {
                    try {
                        const responseJSON = JSON.parse(resText);
                        if (responseJSON.success) {
                            let builder = '';
                            if (responseJSON.messages?.length > 0) {
                                responseJSON.messages?.forEach(message => {
                                    builder +=
                                        `<div class="message-container">
                                        <p class="message-source">${message.codename || "Anonymous"}</p>
                                        <p class="dashboard-message w3-card w3-round-large" style="background: linear-gradient(-45deg, #${message["start-color"]}, #${message["end-color"]}); color: #${message["font-color"]}; font-family: ${message["font-style"]}; cursor: pointer;" onclick="window.location='/messages/${message.id}';">
                                            ${message.message}
                                        </p>
                                        <div class="w3-row">
                                            <button style="cursor: pointer;" class="w3-half share-button" onclick="shareMessage(${JSON.stringify(message).replace(/"/g, "'")})" ontouchstart="shareMessage(${JSON.stringify(message).replace(/"/g, "'")})"><i class="ms-Icon ms-Icon--Mail" aria-hidden="true"></i> &nbsp; Share!</button>
                                            <p class="w3-half message-timestamp">${new Date(message["date-created"])}</p>
                                        </div>
                                    </div>`;
                                });
                                $("#messages-div").html(builder);
                            }
                            else {
                                $("#messages-div").html('Welp! You have no messages yet.<br>Copy and share the link using the button below to start receiving anonymous messages.');
                            }
                        }
                        else {
                            throw "Error From Server Response";
                        }
                    } catch (error) {
                        console.log(error);
                        $("#messages-div").html(`An error has occured:<br>${error}`);
                    }
                }
            );
        }
    );
};


const copyLink = () => {
    fetch("/checkuser").then(
        response => {
            response.text().then(
                userJSON => {
                    const userObj = JSON.parse(userJSON);
                    let link = `${location.protocol}//${location.host}/saysomething/${userObj["link-id"]}`;
                    navigator.clipboard.writeText(link);

                    let swalParams = {
                        icon: "success",
                        showConfirmButton: false,
                        timer: 10000,
                        timerProgressBar: true,
                    };
                    swalParams.title = "Copied!";
                    swalParams.text = `You link has been copied.`;
                    Swal.fire(swalParams);
                }
            );
        }
    );
};

const shareMessage = (messageObj) => {
    // const messageObj = JSON.parse(message);
    let link = `${location.protocol}//${location.host}/messages/${messageObj.id}`;

    if (navigator.share) {
        navigator.share({
            title: 'IJWS Message',
            url: 'link'
        }).then(() => {
            let swalParams = {
                icon: "success",
                showConfirmButton: false,
                timer: 10000,
                timerProgressBar: true,
            };
            swalParams.title = "Shared!";
            swalParams.text = `Thank you for sharing.`;
            Swal.fire(swalParams);
        })
            .catch(console.error);
    } else {
        let swalParams = {
            icon: "error",
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
        };
        swalParams.title = "Sharing Not Supported";
        swalParams.text = `Welp! We tried but the device you're using doesn't seem to support sharing. We still copied the link to the message on your clipboard so you can send it manually.`;
        Swal.fire(swalParams);

        navigator.clipboard.writeText(link);
    }
};