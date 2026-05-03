import { createInterface } from "node:readline/promises";
import { hash, verify } from 'argon2';
import { Buffer } from "node:buffer";
import { readFile, writeFile } from "node:fs/promises";

const pepper = "VeryLongRandomlyGeneratedPasswordWhichShoudBeInAHardWareSecurityModuleThatIDon'tHave";
const pepperInCorrectFormat = new Uint8Array(Buffer.from(pepper, "utf-8"));
const databaseName = "userManagementDatabase.json";

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
    let answer = await inp.question("Are you \n1: logging in or \n2: signing up?: ");
    
    switch (answer)
    {
        case "1":
            authenticateUser();
        break;
        case "2":
            createUser();
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

    let p = await inp.question("Enter password: ");
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
}

async function writeUserToDatabase(username, hash)
{
    let db = await getDatabase();
    Object.defineProperty(db.users, username, {value:"", writable:true, enumerable:true});
    db.users[username] = hash;
    updateDatabase(db);
}

async function makeHash(password)
{
    //uses hash function imported from argon2
    return await hash(password, {secret: pepperInCorrectFormat});
}

async function usernameInDatabase(username)
{
    let db = await getDatabase();
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
    writeFile(databaseName, toWrite);
}

async function getDatabase()
{
    return JSON.parse(await readFile(databaseName, {encoding:"utf-8"}));
}