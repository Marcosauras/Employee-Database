USE company_db;

INSERT INTO departments(name)
VALUES  ("Customer Service"),
        ("Marketing and sales"),
        ("Administration/operations"),
        ("Accounting and finance"),
        ("Research and development");

INSERT INTO roles(title, salary, department_id)
VALUES  ("Customer Service Manager", 50000.01, 1),
        ("Customer care representative", 35000.13, 1),
        ("Marketing Manager", 85000, 2),
        ("Marketing representative", 75000, 2),
        ("Administrator", 90000.02, 3),
        ("Accounting Manager", 65000, 4),
        ("Accountant", 54124.23, 4),
        ("Slime toucher", 32000, 5),
        ("Slime Taste Tester", 899233.99, 5);

INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES  ("Marc", "Allen", 9, NULL),
        ("Carrie", "Krueger", 3, NULL),
        ("Nicole", "Watterson", 5, NULL),
        ("Anais", "Watterson", 6, NULL),
        ("Larry", "Degas", 1, NULL),
        ("Banana", "Joe", 2, 5),
        ("Richard", "watterson", 8, 1),
        ("Bobert", "Robot", 7, 4),
        ("Gumball", "Watterson", 4, 2);