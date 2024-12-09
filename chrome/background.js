// Why is regexSubstitution + extension page not possible in a static ruleset????

const EXT_PAGE = chrome.runtime.getURL("/web_res/redirect.html");
const RULES = [
    {
        "id": 1,
        "priority": 1,
        "action": {
            "type": "redirect",
            "redirect": {
                "regexSubstitution": EXT_PAGE + "?path=\\1"
            }
        },
        "condition": {
            "regexFilter": "https://wiki.wanderinginn.com/(.*)",
            "resourceTypes": ["main_frame"]
        }
    },
    {
        "id": 2,
        "priority": 2,
        "action": {
            "type": "allow"
        },
        "condition": {
            "urlFilter": "|https://wiki.wanderinginn.com/|",
            "resourceTypes": ["main_frame"]
        }
    },
    {
        "id": 3,
        "priority": 2,
        "action": {
            "type": "allow"
        },
        "condition": {
            "urlFilter": "|https://wiki.wanderinginn.com/index.php",
            "resourceTypes": ["main_frame"]
        }
    },
    {
        "id": 4,
        "priority": 2,
        "action": {
            "type": "allow"
        },
        "condition": {
            "urlFilter": "|https://wiki.wanderinginn.com/history",
            "resourceTypes": ["main_frame"]
        }
    },
    {
        "id": 5,
        "priority": 2,
        "action": {
            "type": "allow"
        },
        "condition": {
            "urlFilter": "|https://wiki.wanderinginn.com/*#/media",
            "resourceTypes": ["main_frame"]
        }
    }
];

function add_rules() {
    console.log("Enabling rules");
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: RULES.map(r => r.id),
        addRules: RULES
    });
}

chrome.storage.local.get("enabled").then(data => {
    console.log(data.enabled);
    if (data.enabled || data.enabled === undefined) {
        add_rules();
    }
});


chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
    if (message.type === "enabled") {
        add_rules();
    } else if (message.type === "disabled") {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: RULES.map(r => r.id)
        });
    }
});

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(data => {
    console.log(data);
});