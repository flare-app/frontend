function uuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}
const syncStore = {};

self.addEventListener('install', function(event) {
	event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', function(event) {
	event.waitUntil(self.clients.claim()); // Become available to all pages
});

self.addEventListener('message', event => {
	const id = uuidv4();
	const responseData = event.data;
	syncStore[id] = {type: event.data.type, data: responseData};
	self.registration.sync.register(id);
});

self.addEventListener('sync', event => {
	// get the data by tag
	const {type, data} = syncStore[event.tag];
	if(type === 'response') {
		event.waitUntil(fetch('/repsonse/', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Accept': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/json'
			}
		}));
	} else if(type === 'mistake') {
		event.waitUntil(fetch('/mistake/', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Accept': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/json'
			}
		}));
	}
});