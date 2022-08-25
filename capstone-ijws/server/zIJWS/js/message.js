const loadMessage = () => {
    fetch(`/get-message?id=${location.pathname.split("/")[location.pathname.split("/").length - 1]}`).then(
        response => {
            response.text().then(
                stringedJSON => {
                    try {
                        const message = JSON.parse(stringedJSON);
                        const messageElement = `<div class="message-container">
                            <p class="message-source-big">${message.codename || "Anonymous"}</p>
                            <p class="message-display w3-card w3-round-large" style="background: linear-gradient(-45deg, #${message["start-color"]}, #${message["end-color"]}); color: #${message["font-color"]}; font-family: ${message["font-style"]}">
                                ${message.message}
                            </p>
                            <div class="w3-row">
                                <button style="cursor: pointer;" class="w3-half share-button" onclick="shareMessage(${JSON.stringify(message).replace(/"/g, "'")})" ontouchstart="shareMessage(${JSON.stringify(message).replace(/"/g, "'")})"><i
                                        class="ms-Icon ms-Icon--Mail" aria-hidden="true"></i> &nbsp; Share!</button>
                                <p class="w3-half message-timestamp">${new Date(message["date-created"])}</p>
                            </div>
                        </div>`;
                        $("#messages-div").html(messageElement);
                    } catch (error) {
                        $("#messages-div").html("Oops! There was an error<br>" + error);
                    }
                }
            ).catch(error =>
                $("#messages-div").html("Oops! There was an error<br>" + error)
            );
        }
    ).catch(error =>
        $("#messages-div").html("Oops! There was an error<br>" + error)
    );
};