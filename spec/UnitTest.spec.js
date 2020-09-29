const fetch = require('isomorphic-fetch');
require('es6-promise').polyfill();
const expect = require('chai').expect;
const url = path => `http://localhost:3000${path}`;

describe('Validate Article functionality', () => {
    it('Backend: Unit test to validate POST /login', (done) => {
        fetch(url('/login'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: "jf58",
                password: "123"
            }),
            credentials: 'include'

        }).then(r => r.json()).then(r => {
            expect(r.username).equal("jf58");
            expect(r.result).equal("success");
            done();
        });
    });

    it('Backend: Unit test to validate POST /register', (done) => {
        fetch(url('/register'), {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            // This is the body for the post content
            body: JSON.stringify({
                username: "UnitTest",
                email: "unittest@rice.edu",
                dob: new Date().getTime(),
                zipcode: "12345",
                password: "123",
            }),
            credentials: 'include'
        }).then(r => r.json()).then(r => {
            expect(r.username).equal("UnitTest");
            expect(r.result).equal("success");
            done();
        });
    });

    it('Backend: Unit test to validate GET /headline', (done) => {
        fetch(url('/login'), {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                username: "jf58",
                password: "123"
            }),
            credentials: 'include'
        }).then(r => {
            const cookie = r.headers.get('set-cookie');
            fetch(url('/headline'), {
                method: 'GET',
                headers: {'Content-Type': 'application/json', Cookie: cookie},
                credentials: 'include'
            }).then(r => r.json()).then(r => {
                expect(r.headlines[0].headline).equal('Jian Fang @ Rice Univeristy');
                done();
            });
        });
    });

    it('Backend: Unit test to validate GET /articles', (done) => {
        fetch(url('/login'), {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                username: "jf58",
                password: "123"
        }),
            credentials: 'include'
        }).then(r => {
            const cookie = r.headers.get('set-cookie');
            fetch(url('/articles'), {
                method: 'GET',
                headers: {'Content-Type': 'application/json', Cookie: cookie},
                credentials: 'include'
            }).then(r => r.json()).then(r => {
                expect(r.articles.length).equal(9);
                done();
            });
        });
    });

   it('Backend: Unit test to validate GET /articles/id', (done) => {
        fetch(url('/login'), {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                username: "jf58",
                password: "123"
            }),
            credentials: 'include'
        }).then(r => {
            const cookie = r.headers.get('set-cookie');
            const id = "jf58";
            fetch(url('/articles/' + id), {
                method: 'GET',
                headers: {'Content-Type': 'application/json', Cookie: cookie},
                credentials: 'include'
            }).then(r => r.json()).then(r => {
                expect(r.articles.length).equal(6);
                done();
            });
        });
    });

    it('Backend: Unit test to validate PUT /headline', (done) => {
        fetch(url('/login'), {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                username: "RegisterTest2",
                password: "12345"
            }),
            credentials: 'include'
        }).then(r => {
            const cookie = r.headers.get('set-cookie');
            fetch(url('/headline'), {
                method: 'PUT',
                headers: {'Content-Type': 'application/json', Cookie: cookie},
                credentials: 'include',
                body: JSON.stringify({
                    username: "RegisterTest2",
                    headline: "This is UnitTest"
                })
            }).then(r => r.json()).then(r => {
                expect(r.username).equal('RegisterTest2');
                expect(r.headline).equal('This is UnitTest');
                done();
            });
        });
    });

   it('Backend:Unit test to validate POST /article', (done) => {
        fetch(url('/login'), {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                username: "RegisterTest2",
                password: "12345"
            }),
            credentials: 'include'
        }).then(r => {
            const cookie = r.headers.get('set-cookie');
            fetch(url('/article'), {
                method: 'POST',
                headers: {'Content-Type': 'application/json', Cookie: cookie},
                credentials: 'include',
                body: JSON.stringify({author: "RegisterTest2", avatar: null, img: null, text: "this is unit test post"})
            }).then(r => r.json()).then(r => {
                //console.log(r.articles);
                expect(r.articles.length).equal(1);
                expect(r.articles[0].text).equal( "this is unit test post");
                done();
            });
        });
    });

    it('Backend: Unit test to validate PUT /logout', (done) => {
        fetch(url('/login'), {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                username: "jf58",
                password: "123"
            }),
            credentials: 'include'
        }).then(r => {
            const cookie = r.headers.get('set-cookie');
            fetch(url('/logout'), {
                method: 'PUT',
                headers: {'Content-Type': 'application/json', Cookie: cookie},
                credentials: 'include'
            }).then(r => {
                expect(r.status).equal(200);
                done();
            });
        });
    });


});