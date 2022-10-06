// requiring packages
const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');
require('dotenv').config();
const util = require('util');

// connecting to mysql

const database = mysql.createConnection(
    {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost'
    }
    ,
console.log('Connected to Employee Tracker Database'));

database.query = util.promisify(database.query);

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
    deleteEmployee: 'Delete an Employee',
    deleteDepartment: 'Delete a Department',
    deleteRole: 'Delete a Role',
    viewCompanyBudget: 'View Company\'s Total Budget',
    exit: 'Exit'
};

// function to call the inquirer prompts upon connection to server
function prompt() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'View All Roles',
            'View All Departments',
            'View All Managers',
            'View Company\'s Total Budget',
            'Add Employee',
            'Add Role',
            'Add Department',
            'Udpate Employee Role',
            'Update Employee\'s Manager',
            'Delete an Employee',
            'Delete a Role',
            'Delete a Department',
            'Exit'
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

            case promptMessages.deleteEmployee:
                deleteEmployee();
                break;
            
            case promptMessages.deleteDepartment:
                deleteDepartment();
                break;
            
            case promptMessages.deleteRole:
                deleteRole();
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
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON manager.id = employee.manager_id`

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
    const query = `SELECT *
    FROM role`;

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
    const query =`SELECT * FROM department`;

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

function viewByManager() {
    const query = `SELECT CONCAT (manager.first_name, ' ', manager.last_name) AS manager, department.name AS department, employee.id, employee.first_name, employee.last_name, role.title 
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON manager.id = employee.manager_id 
    ORDER BY manager;`;
    database.query(query, (err, res) => {
        if (err) {
            console.log(err)
        };
        console.log('View Employee by Manager');
        console.table(res);
        prompt();
    })
}

// addEmployees function

async function addEmployee() {
    // access to roles from database
    let roles = await database.query(`SELECT * FROM role`);

    // access to employees from database
    let managers = await database.query(`SELECT * FROM employee`);

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
                    value: role.id
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
                    value: manager.id
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
            role_id: answers.employeeRole,
            manager_id: answers.employeeManager
        });

        console.log('New employee is now added. View All Employees to verify.');
        prompt();
    });
};

async function updateRole() {
    let roles = await database.query(`SELECT * FROM role`);
    let employees = await database.query(`SELECT * FROM employee`);
    const { role, employee } = await inquirer.prompt([
        {
            name: "employee",
            type: "list",
            message: "What is the name of the employee?",
            choices: () => employees.map((employee) => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }
            }),
        },
        {
            name: "role",
            type: "list",
            message: "What is the new employee role?",
            choices: () => roles.map((role) => {
                return {
                    name: role.title,
                    value: role.id
                }
            }
    )}
    ])
    database.query(`UPDATE employee 
    SET role_id = ${role} 
    WHERE id = ${employee}`, (err, res) => {
        if (err) throw err;
        console.log('Role is updated!');
        prompt();
    });
};

// viewCompanyBudget function

function viewCompanyBudget() {
    database.query('SELECT SUM(salary) AS total FROM role', (err, res) => {
        if (err) throw err;
        const budget = JSON.stringify(res[0].total);
        console.log(`The company's total budget is ${budget} dollars.`);
        prompt();
    });
    
};

// addRole function

async function addRole() {
    let departments = await database.query("SELECT * FROM department");
    let answer = await inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: 'What is the name of the new role?'
        },
        {
            name: 'salary',
            type: 'input',
            message: 'What salary will this role earn?'
        },
        {
            name: 'departmentId',
            type: 'list',
            choices: departments.map((departmentId) => {
            return {
                name: departmentId.department_name,
                value: departmentId.id
            }}),
            message: 'What department ID is this role associated with?',
        }
    ])
    let chosenDepartment;
    for (i=0; i < departments.length; i++) {
       if(departments[i].department_id === answer.choice) {
        chosenDepartment = departments[i];
    };
    }
let result = await database.query("INSERT INTO role SET ?", {
    title: answer.title,
    salary: answer.salary,
    department_id: answer.departmentId
});
console.log('Role added successfully.');
prompt();
};

// addDepartment function

async function addDepartment() {
    let answer = await inquirer.prompt([
        {
            name: 'departmentName',
            type: 'input',
            message: 'What is the name of your new department?'
        }
    ]);

    let result = await database.query("INSERT INTO department SET ?", {
        name: answer.departmentName
    });
    console.log("Department was added successfully!");
    prompt();
};

// updateManager Function
async function updateManager() {
    let employees = await database.query(`SELECT * FROM employee`);
    const { manager, employee } = await inquirer.prompt([
        {
            name: "employee",
            type: "list",
            message: "What is the name of the employee?",
            choices: () => employees.map((employee) => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }
            }),
        },
        {
            name: "manager",
            type: "list",
            message: "What is the new employee manager?",
            choices: () => employees.map((employee) => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }
            }
    )}
    ])
    database.query(`UPDATE employee 
    SET manager_id = ${manager} 
    WHERE id = ${employee}`, (err, res) => {
        if (err) throw err;
        console.log('Manager is updated!');
        prompt();
    });
};

// deleteSomething function
 async function deleteEmployee() {
    
        let employees = await database.query(`SELECT * FROM employee`);
        const answer = await inquirer.prompt ([
            {
                name: "employee",
                type: "list",
                message: "Which employee would you like to delete?",
                choices: () => employees.map((employee) => {
                    return {
                        name: `${employee.first_name} ${employee.last_name}`,
                        value: employee.id
                    }
                })
            }
        ]);
        database.query(`DELETE FROM employee WHERE id = ${answer.employee}`);
        prompt();
    };

async function deleteDepartment() {
        let departments = await database.query(`SELECT * FROM department`);
        const answer = await inquirer.prompt ([
            {
                name: "department",
                type: "list",
                message: "Which employee would you like to delete?",
                choices: () => departments.map((department) => {
                    return {
                        name: department.name,
                        value: department.id
                    }
                })
            }
        ])
        database.query(`DELETE FROM department WHERE id = ${answer.department}`);
        prompt();
    };

async function deleteRole() {
        let roles = await database.query(`SELECT * FROM role`);
        const answer = await inquirer.prompt ([
            {
                name: "role",
                type: "list",
                message: "Which employee would you like to delete?",
                choices: () => roles.map((role) => {
                    return {
                        name: role.title,
                        value: role.id
                    }
                })
            }
        ])
        database.query(`DELETE FROM role WHERE id = ${answer.role}`);
        prompt();
    };