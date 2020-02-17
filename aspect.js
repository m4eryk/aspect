// нужно имплементить Csv и MyJson

function User() {
    this.name = null;
    this.age = null;
    this.other = null;
}

const MAPPING_ASPECT = Symbol('MAPPING_ASPECT');


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

User[MAPPING_ASPECT] = [
    {
        key: 'name',
        data: 'FULL_NAME_1',
        parse: (item) => item.split(' ').map(capitalize).join(' '),
        stringify: (item) => item.split(' ').map(item => item.toLowerCase()).join(' '),
    },
    {
        key: 'age',
        data: 'USER_AGE',
        parse: (item) => JSON.parse(item),
        stringify: (item) => JSON.stringify(item)
    },
    {
        key: 'other',
        data: 'USER_INFO'
    },
];

const MyJson = {
    parse: (firstUserJson, User) => {
        const userJSON = JSON.parse(firstUserJson);
        const newUser = new User();

        User[MAPPING_ASPECT].forEach(aspect => aspect.parse ?
            newUser[aspect.key] = aspect.parse(userJSON[aspect.data])
            :
            newUser[aspect.key] = userJSON[aspect.data]
        );

        return newUser;
    },
    stringify: (user) => {
        const stringifyUser = {};

        User[MAPPING_ASPECT].forEach(aspect => aspect.stringify ?
            stringifyUser[aspect.data] = aspect.stringify(user[aspect.key])
            :
            stringifyUser[aspect.data] = user[aspect.key]
        );

        return JSON.stringify(stringifyUser);
    },
};

const Csv = {
    parse: (firstUsersCsv, User) => {
        const resultUsers = [];
        const csvLines = firstUsersCsv.split('\n');

        const headers = csvLines[0].split(',');

        for (let i = 1; i < csvLines.length; i++) {

            const csvUser = {};
            let currentline = csvLines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                csvUser[headers[j]] = currentline[j];
            }

            resultUsers.push(MyJson.parse(csvUser, User));

        }

        return resultUsers;
    },
    stringify: (users) => {
        const headers = JSON.parse(MyJson.stringify(users[0]));
        let str = Object.keys(headers).join(',');

        for (let i = 0; i < users.length; i++) {
            let line = '';

            for (let index in users[i]) {
                if (line !== '') {
                    line += ',';
                }

                line += users[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }
};

const firstUserJson = `
{
    "FULL_NAME_1": "maksim yakusik",
    "USER_AGE": "27",
    "USER_INFO": "some info"
}
`;

const firstUser = MyJson.parse(firstUserJson, User);

/*
    in firstUser objects instance of User
    {
        name: 'Maksim Yakusik'
        age: 27
        other: 'some info'
    }
*/

const resultUserJson = MyJson.stringify(firstUser);

/*
    in resultUserJson string
    {
        "FULL_NAME_1": 'maksim yakusik',
        "USER_AGE": "27",
        "USER_INFO": "some info"
    }
*/


const firstUsersCsv = `USER_AGE,FULL_NAME_1,USER_INFO
                       27,maksim yakusik,some info
                       0,alexander mayorov,other info =)`;


const users = Csv.parse(firstUsersCsv, User);
/*
    in users array objects instance of User
    [
        {
            name: 'Maksim Yakusik'
            age: 27
            other: 'some info'
        }
        {
            name: 'Alexander Mayorov'
            age: 21
            other: 'other info =)'
        }
    ]

*/

const resultUsersCsv = Csv.stringify(users);
/*
    in resultUsersCsv string
    USER_AGE,FULL_NAME_1,USER_INFO
    27,maksim yakusik,some info
    21,alexander mayorov,other info =)
*/
