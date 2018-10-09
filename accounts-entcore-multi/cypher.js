import crypto from 'crypto';
EntcoreMulti.keys = {
	A: {
		date: new Date(0),
		v: 10,
	},
	B: {
		date: new Date(0),
		v: 10,
	},
	current: 'B',
	getDecyphKey(keyId) {
		const store = (keyId.charAt(0) ===  'A') ? this.A : this.B;
		const v = parseInt(keyId.substring(1, 3), 10);
		if(store.v !== v) return undefined;
		const timeCutoff = new Date();
		timeCutoff.setMinutes(timeCutoff.getMinutes() - 20);
		if(store.date < timeCutoff) return undefined;
		return {key: store.key, iv: store.iv};
	},
	getCyphKey() {
		var curr = this[this.current];
		const now = new Date();
		const timeCutoff = new Date(now.getTime()); 
		timeCutoff.setMinutes(timeCutoff.getMinutes() - 10);
		if(curr.date < timeCutoff) {
			this.current = (this.current === 'A') ? 'B' : 'A';
			curr = this[this.current];
			curr.v = (curr.v >= 99) ? 10 : curr.v + 1;
			curr.date = now;
			curr.key = crypto.randomBytes(16);
			curr.iv = crypto.randomBytes(16);
		}
		return {
			keyId: this.current + curr.v,
			key: curr.key,
			iv: curr.iv
		};
	},
	seal(value) {
		const key = this.getCyphKey();
		const c = crypto.createCipheriv('aes128', key.key, key.iv);
		var r = c.update(value, 'utf8', 'base64');
		r += c.final('base64');
		return key.keyId + r;
	},
	open(value) {
		const keyId = value.substring(0, 3);
		const key = this.getDecyphKey(keyId);
		if(!key) return undefined;
		const c = crypto.createDecipheriv('aes128', key.key, key.iv);
		var r = value.substring(3);
		r = c.update(r, 'base64', 'utf8');
		r += c.final('utf8');
		return r;
	}
};
