import { createInterface } from "node:readline/promises";
import { hash, verify } from 'argon2';
import { Buffer } from "node:buffer";
import { readFile, writeFile } from "node:fs/promises";

const pepper = "VeryLongRandomlyGeneratedPasswordWhichShoudBeInAHardWareSecurityModuleThatIDon'tHave";
const pepperInCorrectFormat = new Uint8Array(Buffer.from(pepper, "utf-8"));
const hashedDatabasePath = "userManagementDatabase.json";

var inp = createInterface(
    {
        input: process.stdin,
        output:process.stdout,
    }
);

startLoginSignup();

async function startLoginSignup()
{
    let mode;
    let answer = await inp.question("Are you \n1: logging in \n2: signing up\n3: Converting another database?: ");
    
    switch (answer)
    {
        case "1":
            authenticateUser();
        break;
        case "2":
            createUser();
        break;
        case "3":
            convertDatabase("unhashedDatabase.json");
        break;
        default:
            console.log("Not an option\n");
            startLoginSignup();
    }

    return;
}

async function authenticateUser()
{
    let name = await inp.question("Enter username: ");

    if (!await usernameInDatabase(name))
    {
        console.log("User with username does not exist!")
        return;
    }

    let digest = await getPassword(name);

    let pass = await inp.question("Enter password: ");

    if (!await verify(digest,pass,{secret:pepperInCorrectFormat}))
    {
        console.log("Incorrect password entered");
        return;
    }

    console.log(`Correct login entered. You are logged in as ${name}`);
}

async function createUser()
{
    let name = await inp.question("Enter new username: ");

    if (await usernameInDatabase(name))
    {
        console.log("Please choose a unique username!")
        return;
    }

    let pass = await inp.question("Enter password: ");

    let hash = await makeHash(pass);

    writeUserToDatabase(name, hash);
    console.log(`User added to database:\nName: ${name}\nEntry: ${hash}`);
}

async function writeUserToDatabase(username, hash)
{
    let db = await getDatabase(hashedDatabasePath);
    // Object.assign(db.users, {[username]:hash});

    db["users"][username] = hash;

    updateDatabase(db);
}

async function makeHash(password)
{
    //uses hash function imported from argon2
    return await hash(password, {secret: pepperInCorrectFormat});
}

async function usernameInDatabase(username)
{
    let db = await getDatabase(hashedDatabasePath);
    return Object.hasOwn(db.users, username);
}

async function updateDatabase(newDatabase)
{
    if (typeof newDatabase !== "object")
    {
        console.log("new database is not an object");
        return;
    }

    if (!Object.hasOwn(newDatabase, "dbCheck"))
    {
        console.log("original database not modified");
        return;
    }

    let toWrite = JSON.stringify(newDatabase);
    toWrite = new Uint8Array(Buffer.from(toWrite, "utf-8"));
    writeFile(hashedDatabasePath, toWrite);
}

async function getPassword(username)
{
    let db = await getDatabase(hashedDatabasePath);
    return db.users[username];
}

async function getDatabase(filePath)
{
    return JSON.parse(await readFile(filePath, {encoding:"utf-8"}));
}

async function convertDatabase(unhashedDatabasePath)
{
    let udb = await getDatabase(unhashedDatabasePath);
    let db = await getDatabase(hashedDatabasePath)

    let usernames = Object.keys(udb.users);
    
    for (const currentUsername of usernames)
    {
        let plainPassword = udb.users[currentUsername];
        let hashedPassword = await makeHash(plainPassword);
        udb["users"][currentUsername] = hashedPassword;
    }
    
    db.users = Object.assign(db.users, udb.users);
    console.log(db.users);

    updateDatabase(db);
}