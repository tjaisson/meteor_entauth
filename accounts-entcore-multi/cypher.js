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
		return store.key;
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
		}
		return {
			keyId: this.current + curr.v,
			key: curr.key,
		};
	},
	seal(value) {
		const key = this.getCyphKey();
		const iv = crypto.randomBytes(16);
		const c = crypto.createCipheriv('aes128', key.key, iv);
		var r = c.update(value, 'utf8');
		r = Buffer.concat([iv, r, c.final()]);
		return key.keyId + r.toString('base64');
	},
	open(value) {
		const keyId = value.substring(0, 3);
		const key = this.getDecyphKey(keyId);
		if(!key) return undefined;
		const r = Buffer.from(value.substring(3), 'base64');
		const c = crypto.createDecipheriv('aes128', key, r.slice(0, 16));
		var s = c.update(r.slice(16), 0, 'utf8');
		s += c.final('utf8');
		return s;
	}
};
