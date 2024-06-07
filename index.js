import http from 'http';
import fs from 'fs'

const PORT = 3000;

let courses = [];

fs.readFile('./data/topics.json', (err, data) => {
    if (err) {
        console.error("Could not read file:", err);
        return;
    }
    courses = JSON.parse(data);
});

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:3000`);
    const path = url.pathname;
    const searchParams = url.searchParams;
    if (path === '/api/courses' && req.method === 'GET') {
        searchCourses(req, res, {name:searchParams.get('q'), filter: searchParams.get('filter'), order: searchParams.get('order')});
    } else if (path.startsWith('/api/courses/') && req.method === 'GET') {
        getCourseById(req, res, path.split('/')[2]);
    } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ message: "Not Found" }));
    }
});

function getCourseById(req, res, id) {
    const course = courses.find(course => course.id === parseInt(id));
    if (course) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(course));
    } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ message: "Course not found" }));
    }
}


// the requirements of the search is not clear yet, so It's not fully functional.
function searchCourses(req, res, query) {
    query = query? query :{};
    const {name, filter, order} = query;
    let result = courses;
    if(name){
        result = result.filter(course => course.topic.toLowerCase().includes(name.toLowerCase()) || course.category.toLowerCase().includes(name.toLowerCase()));
    }
    if(filter){
        // result = result.filter(course=> course.rating >= filter);
    }
    if(order){
        result = result.sort((a,b)=> a.rating > b.rating ? -1: a.rating == b.rating ? 0 : 1 );
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
