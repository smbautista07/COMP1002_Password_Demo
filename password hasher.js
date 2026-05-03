import { createInterface } from "node:readline/promises";
import { hash, verify } from 'argon2';
import { Buffer } from "node:buffer";
import { readFile, appendFile } from "node:fs/promises";

const pepper = "VeryLongRandomlyGeneratedPasswordWhichShoudBeInAHardWareSecurityModuleThatIDon'tHave";
const pepperInCorrectFormat = new Uint8Array(Buffer.from(pepper, "utf-8"));
const dataBaseName = "userManagementDatabase.json";

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
            mode = "AuthenticateUser";
        break;
        case "2":
            mode = "CreateUser";
        break;
        default:
            console.log("Not an option\n");
            startLoginSignup();
            
    }

    if (mode)
    {
        let u = await inp.question("Enter username: ");
    }
    
    return;
}

async function getDataBase()
{
    return JSON.parse(await readFile(dataBaseName, {encoding:"utf-8"}));
}