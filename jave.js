var name = 'Jackrabbit';
const url = 'https://api.api-ninjas.com/v1/animals?name=' + name;

fetch(url, {
    method: 'GET',
    headers: { 
        'X-Api-Key': '67oZYx5LVQm0O+Fe9Xz4VA==rZEeyNhvZDq0N32L',
        'Content-Type': 'application/json'
    }
})
.then(res => {
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
})
.then(result => {
    console.log(result);
})
.catch(error => {
    console.error('Error: ', error.message);
});
