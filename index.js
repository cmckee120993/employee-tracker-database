// requiring packages
const mysql = require('mysql2');
const inquirer = require('inquirer');
const Connection = require('mysql2/typings/mysql/lib/Connection');
const consoleTable = require('console.table');
require('dotenv').config()

// connecting to mysql

const database = mysql.createConnection(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
    host: 'localhost',
    port: 3001,
    dialect: 'mysql'
    }
    ,
console.log('Connected to Employee Tracker Database'));

// mesages to prompt using inquirer in an array
const promptMessages = {
    viewEmployees: 'View All Employees',
    addEmployee: 'Add Employee',
    updateRole: 'Udpate Employee Role',
    viewAllRoles: 'View All Roles',
    addRole: 'Add Role',
    viewAllDepartments: 'View All Departments',
    addDepartment: 'Add Department',
    updateManager: 'Update Employee\'s Manager',
    viewByManager: 'View All Managers',
    deleteSomething: 'Delete Department, Role, or Employee',
    viewCompanyBudget: 'View Company\'s Total Budget'
};

// function to call the inquirer prompts upon connection to server
function prompt() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            promptMessages.viewEmployees,
            promptMessages.addEmployee,
            promptMessages.updateRole,
            promptMessages.viewAllRoles,
            promptMessages.addRole,
            promptMessages.viewAllDepartments,
            promptMessages.addDepartment,
            promptMessages.updateManager,
            promptMessages.viewByManager,
            promptMessages.deleteSomething,
            promptMessages.viewCompanyBudget,
            promptMessages.viewByDepartment,
            promptMessages.exit
        ]
    })
    // cases to go through depending on user choice
    .then(answer => {
        console.log(answer);
        switch (answer.action) {
            case promptMessages.viewEmployees:
                viewAllEmployees();
                break;
            
            case promptMessages.addEmployee:
                addEmployee();
                break;

            case promptMessages.updateRole:
                updateRole();
                break;
            
            case promptMessages.viewAllRoles:
                viewAllRoles();
                break;
            
            case promptMessages.addRole:
                addRole();
                break;

            case promptMessages.viewAllDepartments:
                viewAllDepartments();
                break;

            case promptMessages.addDepartment:
                addDepartment();
                break;

            case promptMessages.updateManager:
                updateManager();
                break;
            
            case promptMessages.viewByManager:
                viewByManager();
                break;

            case promptMessages.deleteSomething:
                    deleteSomething();
                    break;
                
            case promptMessages.viewCompanyBudget:
                    viewCompanyBudget();
                    break;
            
            case promptMessages.viewByDepartment:
                viewByDepartment();
                break;
            
            case promptMessages.exit:
                database.end();
                break;
        };
    });
};

// connection to DB to begin prompt upon running npm run start
database.connect( err =>{
    if(err) {
        console.log(err)
    };
    prompt();
});

// view employees function

function viewAllEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary
    FROM employee`

    // connect to database for query
    database.query(query, (err, res) => {
        if (err) {
            console.log(err)
        };
        console.log('View All Employees');
        console.table(res);
        prompt();
    })
};

// viewAllRoles function

function viewAllRoles() {
    const query = `SELECT role.id, role.title, department.name, role.salary
    FROM employee`;

    database.query(query, (err, res) => {
        if (err) {
            console.log(err)
        };
        console.log('View All Roles');
        console.table(res);
        prompt();
    })
};

// viewAllDepartments function

function viewAllDepartments() {
    const query =`SELECT department.id, department.name
    FROM employee`;

    database.query(query, (err, res) => {
        if (err) {
            console.log(err)
        };
        console.log('View All Departments');
        console.table(res);
        prompt();
    })
};

// viewByDepartment function

function viewByDepartment() {
    const query = `SELECT department.id, department.name, employee.first_name, employee.last_name
    ORDER BY department.name
    FROM tracker_db`;

    database.query(query, (err, res) => {
        if (err) {
            console.log(err)
        };
        console.log('View Employees By Department');
        console.table(res);
        prompt();
    })
};

// viewByManager function

// function viewByManager() {
//     const query = `SELECT `
// }

// addEmployees function

function addEmployee() {
    // access to roles from database
    let roles = connection.query(`SELECT * FROM role`);

    // access to employees from database
    let managers = connection.query(`SELECT * FROM employee`);

    inquirer.prompt(
        [{
            type: "input",
            name: "first_name",
            message: "Enter employee's first name"
        },

        {
            type: "input",
            name: "last_name",
            message: "Enter employee's last name"
        },
        {
            type: "list",
            name: "employeeRole",
            choices: roles.map((role) => {
                return {
                    name: role.title,
                    role_id: role.id
                }
            }),
            message: "What is the employee\'s role?"
        },
        {
            type: "list",
            name: "employeeManager",
            choices: managers.map((manager) => {
                return {
                    name: `${manager.first_name} ${manager.last_name}`,
                    manager_id: manager.id
                }
            }),
            message: "Who is the employee\'s manager?"
        }]
    )
    .then(answers => {
        database.query(`INSERT INTO employee SET ?`,
        {
            first_name: answers.first_name,
            last_name: answers.last_name,
            role_id: answers.employeeRole.role_id,
            manager_id: answers.employeeManager.manager_id
        });

        console.log('New employee is now added. View All Employees to verify.');
        prompt();
    });
};
