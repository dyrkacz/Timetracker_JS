const apikey = 'd2ca953f-bba0-447d-8a1b-ec23b7373f35';
const apihost = 'https://todo-api.coderslab.pl';


document.addEventListener('DOMContentLoaded', function () {
    const formadd = document.querySelector("form");


    function apiListTasks() {
        return fetch(
            apihost + '/api/tasks',
            {
                headers: {Authorization: apikey}
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiListOperationsForTask(taskId) {
        return fetch(
            apihost + `/api/tasks/${taskId}/operations`,
            {
                headers: {Authorization: apikey}
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        );
    }

    function renderTask(taskId, title, description, status) {
        const section = document.createElement('section');
        section.className = 'card mt-5 shadow-sm';
        document.querySelector('main').appendChild(section);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
        section.appendChild(headerDiv);

        const headerLeftDiv = document.createElement('div');
        headerDiv.appendChild(headerLeftDiv);

        const h5 = document.createElement('h5');
        h5.innerText = title;
        headerLeftDiv.appendChild(h5);

        const h6 = document.createElement('h6');
        h6.className = 'card-subtitle text-muted';
        h6.innerText = description;
        headerLeftDiv.appendChild(h6);

        const headerRightDiv = document.createElement('div');
        headerDiv.appendChild(headerRightDiv);

        if (status == 'open') {
            const finishButton = document.createElement('button');
            finishButton.className = 'btn btn-dark btn-sm js-task-open-only js-task-open-only';
            finishButton.innerText = 'Finish';
            headerRightDiv.appendChild(finishButton);

            finishButton.addEventListener("click", function (){
                apiUpdateTask(taskId,title,description,"closed").then(function (){
                section.querySelectorAll(".js-task-open-only").forEach(function (el){
                    el.parentElement.removeChild(el);
                });
                });
            });
        }

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
        deleteButton.innerText = 'Delete';
        headerRightDiv.appendChild(deleteButton);

        deleteButton.addEventListener('click', function () {

            apiDeleteTask(taskId).then(function () {
                section.parentElement.removeChild(section);
            });

        });

        const operationDescription = document.createElement("ul");
        operationDescription.classList.add("list-group", "list-group-flush");
        section.appendChild(operationDescription);

        const footerDiv = document.createElement("div");
        footerDiv.classList.add("card-body", "js-task-open-only");
        section.appendChild(footerDiv);

        const footerForm = document.createElement("form");
        footerDiv.appendChild(footerForm);

        const footerFormDiv = document.createElement("div");
        footerFormDiv.classList.add("input-group");
        footerForm.appendChild(footerFormDiv);

        const footerFormDivInput = document.createElement("input");
        footerFormDivInput.type = "text";
        footerFormDivInput.placeholder = "Operation description";
        footerFormDivInput.classList.add("form-control");
        footerFormDivInput.minLength = "5";
        footerFormDiv.appendChild(footerFormDivInput);

        const footerFormDivDiv = document.createElement("div");
        footerFormDivDiv.classList.add("input-group-append");
        footerFormDiv.appendChild(footerFormDivDiv);

        const footerFormDivDivButton = document.createElement("button");
        footerFormDivDivButton.classList.add("btn", "btn-info");
        footerFormDivDivButton.innerText = "Add";
        footerFormDivDiv.appendChild(footerFormDivDivButton);

        footerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            let descriptionOperation = footerFormDivInput.value;
            apiCreateOperationForTask(taskId, descriptionOperation).then(function (response) {
                renderOperation(operationDescription, status, response.data.id, response.data.description, response.data.timeSpent);
            });
            footerForm.reset();
        });

        apiListOperationsForTask(taskId).then(
            function (response) {
                response.data.forEach(
                    function (operation) {
                        renderOperation(operationDescription, status, operation.id, operation.description, operation.timeSpent);
                    }
                );
            }
        );

    }

    function renderOperation(operationsList, status, operationId, operationDescription, timeSpent) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        operationsList.appendChild(li);

        const descriptionDiv = document.createElement('div');
        descriptionDiv.innerText = operationDescription;
        li.appendChild(descriptionDiv);

        const time = document.createElement('span');
        time.className = 'badge badge-success badge-pill ml-2';
        time.innerText = timeConver(timeSpent);
        descriptionDiv.appendChild(time);

        if (status == "open") {
            const divButtons = document.createElement("div");
            li.appendChild(divButtons);

            const button1 = document.createElement("button");
            button1.classList.add("btn", "btn-outline-success", "btn-sm", "mr-2","js-task-open-only");
            button1.innerText = "+15m";
            divButtons.appendChild(button1);
            const button2 = document.createElement("button");
            button2.classList.add("btn", "btn-outline-success", "btn-sm", "mr-2","js-task-open-only");
            button2.innerText = "+1h";
            divButtons.appendChild(button2);
            const button3 = document.createElement("button");
            button3.classList.add("btn", "btn-outline-danger", "btn-sm", "js-task-open-only");
            button3.innerText = "Delete";
            divButtons.appendChild(button3);

            button1.addEventListener("click", function () {
                timeSpent += 15;
                apiUpdateOperation(operationId, operationDescription, timeSpent).then(function (response) {
                    time.innerText = timeConver(timeSpent);
                });
            });
            button2.addEventListener("click", function () {
                timeSpent += 60;
                apiUpdateOperation(operationId, operationDescription, timeSpent).then(function (response) {
                    time.innerText = timeConver(timeSpent);
                });
            });
            button3.addEventListener("click", function () {
                apiDeleteOperation(operationId).then(function () {
                    li.parentElement.removeChild(li);
                });
            });
        }

    }


    apiListTasks().then(
        function (response) {
            response.data.forEach(
                function (task) {
                    renderTask(task.id, task.title, task.description, task.status);
                }
            );

        }
    );


    function apiCreateTask(title, description) {
        return fetch(
            apihost + '/api/tasks',
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({title: title, description: description, status: 'open'}),
                method: 'POST'
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiCreateOperationForTask(taskId, description) {
        return fetch(
            apihost + `/api/tasks/${taskId}/operations`,
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({description: description, timeSpent: 0}),
                method: 'POST'
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiUpdateOperation(operationId, description, timeSpent) {
        return fetch(
            apihost + `/api/operations/${operationId}`,
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({description: description, timeSpent: timeSpent}),
                method: 'PUT'
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    formadd.addEventListener("submit", function (event) {
        event.preventDefault();
        let title = formadd.querySelector("[name=\"title\"]").value;
        console.log(title);
        let description = formadd.querySelector("[name=\"description\"]").value;
        console.log(description);
        apiCreateTask(title, description).then(
            function (response) {
                renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
            });
        formadd.reset();
    });

    function apiDeleteTask(taskId) {
        return fetch(
            apihost + `/api/tasks/${taskId}`,
            {

                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                method: 'DELETE'
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiDeleteOperation(operationId) {
        return fetch(
            apihost + `/api/operations/${operationId}`,
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                method: 'DELETE'
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiUpdateTask(taskId, title, description, status){
        return fetch(
            apihost + `/api/tasks/${taskId}`,
            {
                headers: {Authorization: apikey, 'Content-Type': 'application/json'},
                body: JSON.stringify({title: title, description: description, status: status}),
                method: 'PUT'
            }
        ).then(
            function (resp) {
                if (!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function timeConver(number) {
        let temp = parseInt(number);
        if (temp >= 60) {
            let h = temp / 60;
            let min = temp % 60;
            return Math.floor(h) + "h " + min + "m";
        } else {
            return temp + "m";
        }
    }

});


