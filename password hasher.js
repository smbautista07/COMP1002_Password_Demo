import {createInterface} from "node:readline";
import {hash} from 'argon2';
import { Buffer } from "node:buffer";

const pepper = "VeryLongRandomlyGeneratedPasswordWhichShoudBeInAHardWareSecurityModuleThatIDon'tHave";
const pepperInCorrectFormat = Buffer.from(pepper, "utf-8");

var inp = createInterface(
    {
        input: process.stdin,
        output:process.stdout,
    }
);

inp.question("Input a password:", (password) =>
{
    makeHash(password, outputHash);
});

async function makeHash(password, callback)
{
    var newPass = await hash(password, {secret: pepperInCorrectFormat});
    callback(newPass);
}

async function outputHash(hash)
{
    console.log(hash);
}

