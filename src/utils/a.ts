// const list1=[1,2,3,5]
// const l2= list1.filter( (itm ) => itm%2 === 0)
// console.log(l2)
// console.log(list1.includes(3))

// const list1=[1,2,""]
// list1.splice(3,0,"welcome")
// list1.push(2.1)
// for (const itm of list1)
//     console.log(itm)

type User = {
    "name": string 
    "age": number}
const user1: User = {
    "name": "John",
    "age": 0
}

for(const [k,v] of Object.entries(user1))
    {
        if (String(v).length != 0)
            {console.log(k,v)}
    }