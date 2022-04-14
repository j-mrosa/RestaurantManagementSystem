const API_BASE = "http://localhost:8000/items";
const DBCOUNT = 39;
let ALL_ITEMS;
let ALL_TESTS;

window.onload = function () {
    ALL_TESTS = initTests();
    buildWebPage();
    addEventHandlers();
    requirementsCheck(); // also initializes ALL_ITEMS
};

function requirementsCheck() {
    let url = "http://localhost:8000/items";
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            let initialState = loadDataAndCheckState(
                xhr.status,
                xhr.responseText
            );
            ALL_ITEMS = initialState.items;
            document.querySelector("#requirementsCheck").innerHTML =
                initialState.msg;
            document
                .querySelector("#requirementsCheck")
                .setAttribute(
                    "class",
                    initialState.ok
                        ? "requirementsPassed"
                        : "requirementsFailed"
                );
            refreshButtonStates(initialState.ok);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function loadDataAndCheckState(status, text) {
    let items,
        res,
        errors = [];
    if (status !== 200) {
        errors.push("ERROR: initial GET responded with status " + xhr.status);
    } else {
        items = JSON.parse(text);
        let deletedItem = findItem(items, 202);
        let insertedItem = findItem(items, 777);
        let updatedItem = findItem(items, 303);

        if (items.length !== DBCOUNT) {
            errors.push(
                "ERROR: database does not contain expected number of items"
            );
        }
        if (deletedItem === null) {
            errors.push("ERROR: item 202 is missing");
        }
        if (insertedItem !== null) {
            errors.push("ERROR: item 777 should not exist");
        }
        if (
            updatedItem !== null &&
            updatedItem.description === "not a real item"
        ) {
            errors.push("ERROR: item 303 has incorrect data");
        }
    }

    res = {
        items: items,
        ok: errors.length === 0,
        msg:
            errors.length === 0
                ? "GET is working, and database is in correct state - good to go!"
                : errors.join("<br>"),
    };

    return res;
}

function findItem(items, id) {
    let res = null;
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.id === id) {
            res = { ...item };
            break;
        }
    }
    return res;
}

function refreshButtonStates(enable) {
    let testButtons = document.querySelectorAll("button");
    for (let i = 0; i < testButtons.length; i++) {
        testButtons[i].toggleAttribute("disabled", !enable);
    }
}

function buildWebPage() {
    addTestsToTable(
        document.querySelector("#shouldSucceed table"),
        ALL_TESTS.shouldSucceed
    );
    addTestsToTable(
        document.querySelector("#shouldFail table"),
        ALL_TESTS.shouldFail
    );
}

function addTestsToTable(table, tests) {
    tests.forEach((t) => {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        let pre = document.createElement("pre");
        let obj = {
            testID: t.testID,
            description: t.description,
            method: t.method,
            url: t.url,
        };
        pre.innerHTML = JSON.stringify(obj, null, 2);
        td.appendChild(pre);
        tr.appendChild(td);

        td = document.createElement("td");
        td.innerHTML = t.expectedResult.statusCode;
        tr.appendChild(td);

        td = document.createElement("td");
        pre = document.createElement("pre");
        let text = t.expectedResult.text;
        if (t.expectedResult.textType === "json") {
            pre.innerHTML = JSON.stringify(text, null, 2);
            td.appendChild(pre);
        } else {
            td.innerHTML = "complete 404 web page";
        }
        tr.appendChild(td);

        td = document.createElement("td");
        let btn = document.createElement("button");
        btn.classList.add("testButton");
        btn.innerHTML = "run";
        td.appendChild(btn);
        tr.appendChild(td);

        tr.appendChild(document.createElement("td")); // empty

        table.appendChild(tr);
    });
}

function addEventHandlers() {
    // add event handlers for individual testing buttons
    let testButtons = document.querySelectorAll(".testButton");
    for (let i = 0; i < testButtons.length; i++) {
        testButtons[i].addEventListener("click", runTest);
    }

    // add event handlers for button that tests all errors
    document
        .querySelector("#testAllErrorsButton")
        .addEventListener("click", runAllErrorTests);
}

function runAllErrorTests(e) {
    let button = e.target;
    let childButtons = button
        .closest("table")
        .querySelectorAll(".testButton:not(:disabled)");
    for (let i = 0; i < childButtons.length; i++) {
        childButtons[i].click();
    }
}

function runTest(e) {
    e.target.setAttribute("disabled", "disabled");
    let id = JSON.parse(
        e.target.parentElement.parentElement.querySelector("td:first-child pre")
            .innerHTML
    ).testID;
    let testCase = findTestCase(id);

    let method = testCase.method;
    let url = testCase.url;
    let newObj = testCase.newObj;

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            reportResult(e.target, testCase, xhr.status, xhr.responseText);
            console.log(xhr.status + " --> " + xhr.responseText);
        }
    };
    xhr.open(method, url, true);
    if (method === "GET" || method === "DELETE") {
        xhr.send();
    } else {
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(newObj));
    }
}

function reportResult(button, testCase, actualStatus, actualText) {
    let passCell =
        button.parentElement.parentElement.querySelector("td:last-child");
    let exp = testCase.expectedResult;
    if (exp.exactMatch) {
        let act = JSON.parse(actualText);
        let pass = exp.statusCode === actualStatus;
        pass = pass && exp.text.ok === act.ok;
        pass = pass && exp.text.err === act.err;
        passCell.setAttribute("class", pass ? "resultPassed" : "resultFailed");
        passCell.innerHTML = pass ? "PASS" : "FAIL";
    } else {
        console.log(actualText);
        passCell.setAttribute("class", "resultToBeChecked");
        passCell.innerHTML = "check console to see if web page was returned";
    }
}

function findTestCase(id) {
    let res = null;
    let theTests = ALL_TESTS.shouldSucceed.concat(ALL_TESTS.shouldFail);
    for (let i = 0; i < theTests.length; i++) {
        let t = theTests[i];
        if (t.testID === id) {
            res = { ...t };
            break;
        }
    }
    return res;
}

function initTests() {
    return {
        shouldSucceed: [
            {
                testID: "succeed-01",
                description: "Delete an existing item",
                method: "DELETE",
                url: "http://localhost:8000/items/202",
                expectedResult: {
                    statusCode: 200,
                    text: { ok: true, err: null },
                    textType: "json",
                    exactMatch: true,
                },
            },
            {
                testID: "succeed-02",
                description: "Update an existing item",
                method: "PUT",
                url: "http://localhost:8000/items/303",
                expectedResult: {
                    statusCode: 200,
                    text: { ok: true, err: null },
                    textType: "json",
                    exactMatch: true,
                },
                newObj: {
                    id: 303,
                    category: "ENT",
                    description: "not a real item",
                    price: 99,
                    vegetarian: true,
                },
            },
            {
                testID: "succeed-03",
                description: "Add a new item",
                method: "POST",
                url: "http://localhost:8000/items/777",
                expectedResult: {
                    statusCode: 201,
                    text: { ok: true, err: null },
                    textType: "json",
                    exactMatch: true,
                },
                newObj: {
                    id: 777,
                    category: "ENT",
                    description: "a new item",
                    price: 77,
                    vegetarian: true,
                },
            },
        ],
        shouldFail: [
            {
                testID: "fail-01",
                description: "Get a single item",
                method: "GET",
                url: "http://localhost:8000/items/101",
                expectedResult: {
                    statusCode: 405,
                    text: { ok: false, err: "individual GET not allowed" },
                    textType: "json",
                    exactMatch: true,
                },
            },
            {
                testID: "fail-02",
                description: "Delete multiple items",
                method: "DELETE",
                url: "http://localhost:8000/items",
                expectedResult: {
                    statusCode: 405,
                    text: { ok: false, err: "bulk deletes not allowed" },
                    textType: "json",
                    exactMatch: true,
                },
            },
            {
                testID: "fail-03",
                description: "Update multiple items",
                method: "PUT",
                url: "http://localhost:8000/items",
                expectedResult: {
                    statusCode: 405,
                    text: { ok: false, err: "bulk updates not allowed" },
                    textType: "json",
                    exactMatch: true,
                },
            },
            {
                testID: "fail-04",
                description: "Add multiple items",
                method: "POST",
                url: "http://localhost:8000/items",
                expectedResult: {
                    statusCode: 405,
                    text: { ok: false, err: "bulk inserts not allowed" },
                    textType: "json",
                    exactMatch: true,
                },
            },
            {
                testID: "fail-05",
                description: "Delete item that doesn't exist",
                method: "DELETE",
                url: "http://localhost:8000/items/999",
                expectedResult: {
                    statusCode: 404,
                    text: { ok: false, err: "item does not exist" },
                    textType: "json",
                    exactMatch: true,
                },
            },
            {
                testID: "fail-06",
                description: "Update item that doesn't exist",
                method: "PUT",
                url: "http://localhost:8000/items/999",
                expectedResult: {
                    statusCode: 404,
                    text: { ok: false, err: "item does not exist" },
                    textType: "json",
                    exactMatch: true,
                },
                newObj: {
                    id: 999,
                    category: "ENT",
                    description: "a new item",
                    price: 77,
                    vegetarian: true,
                },
            },
            {
                testID: "fail-07",
                description: "Add item that already exists",
                method: "POST",
                url: "http://localhost:8000/items/101",
                expectedResult: {
                    statusCode: 409,
                    text: { ok: false, err: "item already exists" },
                    textType: "json",
                    exactMatch: true,
                },
                newObj: {
                    id: 101,
                    category: "ENT",
                    description: "a new item",
                    price: 77,
                    vegetarian: true,
                },
            },
            {
                testID: "fail-08",
                description: "URL has invalid collection pattern",
                method: "GET",
                url: "http://localhost:8000/item",
                expectedResult: {
                    statusCode: 404,
                    text: "complete web page (404)",
                    textType: "html",
                    exactMatch: false,
                },
            },
            {
                testID: "fail-09",
                description: "URL has invalid individual pattern",
                method: "GET",
                url: "http://localhost:8000/items/12",
                expectedResult: {
                    statusCode: 404,
                    text: "complete web page (404)",
                    textType: "html",
                    exactMatch: false,
                },
            },
            {
                testID: "fail-10",
                description: "URL has invalid individual pattern",
                method: "GET",
                url: "http://localhost:8000/items/1234",
                expectedResult: {
                    statusCode: 404,
                    text: "complete web page (404)",
                    textType: "html",
                    exactMatch: false,
                },
            },
        ],
    };
}
