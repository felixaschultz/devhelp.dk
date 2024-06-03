function getBrowser() {
    const userAgent = navigator.userAgent;
    let browser = "Unknown Browser";
    if (userAgent.indexOf("Chrome") > -1) {
        browser = "Google Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browser = "Safari";
    } else if (userAgent.indexOf("Firefox") > -1) {
        browser = "Mozilla Firefox";
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
        browser = "Microsoft Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        browser = "Microsoft Edge";
    } else if (userAgent.indexOf("Opera") > -1) {
        browser = "Opera";
    }
    return browser;
}

export function ca(event, argument) {
    const dataLayer = window.dataLayer || [];
    const uniqueID = Math.floor(Math.random() * 1000000000);
    switch (event) {
        case "PageView":
            dataLayer.push({
                event: event,
                ...argument,
                title: document.title,
                referrer: document.referrer,
                landingPage: location.href,
                device: {
                    browser: getBrowser(),
                    language: navigator.language,
                    userAgent: navigator.userAgent,
                    screenSize: window.screen.width + "x" + window.screen.height,
                    devicePixelRatio: window.devicePixelRatio,
                    platform: navigator.userAgent.split(" ")[1].split("(")[1].split(";")[0].replace(";", ""),
                    osVersion: navigator.userAgent.split(" ")[navigator.userAgent.split(" ").length - 2].split("/")[1]
                },
                date: new Date().toUTCString(),
                uniqueID: uniqueID
            });
            break;
        case "Login":
            if (argument.loggedIn) {
                dataLayer.push({
                    event: event,
                    date: new Date().toUTCString(),
                    pathname: location.pathname,
                    ...argument
                });
            }
            break;
        case "Signup":
            dataLayer.push({
                event: event,
                date: new Date().toUTCString(),
                pathname: location.pathname,
                ...argument
            });
            break;
    }
    document.addEventListener("click", function (event) {
        dataLayer.push({
            event: "Click",
            date: new Date().toUTCString(),
            targetHref: event?.target?.href,
        }) // Click event
    })
    if (dataLayer.length > 0) {

        let getRootDomain = function (domain = window.location.hostname) {
            let split = domain.split(".");
            let len = split.length;
            if (len > 2) {
                domain = split[len - 2] + "." + split[len - 1];
            }
            return domain;
        }

        fetch("/api/analytics?layer=" + JSON.stringify(dataLayer), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataLayer),
            keepalive: true
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
                // Set a cookie after a successful request
            }).then(res => {
            }).finally((res) => {
                // Checking cookie uuid and setting it if not present
                if (document.cookie.indexOf("_ca") > -1) {
                    return;
                }

                const cookieValue = 1 + "." + uniqueID + "." + new Date().getTime();
                document.cookie = "_ca=" + cookieValue + "; path=/; domain=." + getRootDomain() + "; max-age=31536000;";
            })
            .catch(error => console.error('Error:', error));
    }
}