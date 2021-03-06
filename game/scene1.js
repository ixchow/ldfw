exports = function() {
	this.fade = 0.0;
	this.spin = 0.0;
	this.mesh = meshes.tree.trunk;
	return this;
}

var Vec3 = engine.Vec3;
var Mat4 = engine.Mat4;

//create 4x4 "look at" matrix which:
//     aligns -z axis with the target,
//     places eye at the origin,
//     and aligns 'up_vec' to the +y axis
function lookAt(eye, target, up) {
	var y = up.normalized();
	var z = eye.minus(target).normalized();
	var x = y.cross(z);
	//matrix (column-major order):
	return new Mat4(
		x.x, y.x, z.x, 0.0,
		x.y, y.y, z.y, 0.0,
		x.z, y.z, z.z, 0.0,
		-eye.dot(x), -eye.dot(y), -eye.dot(z), 1.0
	);
}

function perspective(fovy, aspect, near, far) {
	var f =  Math.tan(fovy * 0.5 / 180.0 * Math.PI);
	return new Mat4(
		f / aspect, 0.0, 0.0, 0.0,
		0.0, f, 0.0, 0.0,
		0.0, 0.0, (far + near) / (near - far), -1.0,
		0.0, 0.0, 2 * (far * near) / (near - far), 0.0
	);
}

/*
(function(){
	var MV = lookAt(new Vec3(10.0, 10.0, 10.0), new Vec3(0.0, 0.0, 0.0), new Vec3(0.0, 0.0, 1.0));
	var P = perspective(60.0, 1.0, 0.1, 100.0);
	console.log(MV);
	console.log(P);
	console.log(P.times(MV));
}());
*/

exports.prototype.update = function(elapsed) {
	this.fade += elapsed;
	if (this.fade > 1.0) this.fade = this.fade % 1.0;

	this.spin += elapsed;
	if (this.spin > Math.Pi * 2.0) this.spin = this.spin % (Math.Pi * 2.0);
};

exports.prototype.enter = function() {
	// engine.music.play(music.gymnopedie, synths.bells);
	// engine.music.play(music.khoomii, synths.vowels);
};


exports.prototype.draw = function() {
	gl.clearColor(0.0, 0.0, this.fade, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);

	var vertsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);

	var s = shaders.solid;

	gl.useProgram(s);

	var MV = lookAt(new Vec3(Math.cos(this.spin), Math.sin(this.spin), 1.0).times(6.0), new Vec3(0.0, 0.0, 0.0), new Vec3(0.0, 0.0, 1.0));
	var P = perspective(45.0, engine.Size.x / engine.Size.y, 0.1, 100.0);


	gl.enableVertexAttribArray(s.aVertex.location);
	gl.vertexAttribPointer(s.aVertex.location, 3, gl.FLOAT, false, 0, 0);


	gl.vertexAttrib4f(s.aColor.location, 0.5, 0.5, 0.0, 1.0);

	gl.uniformMatrix4fv(s.uMVP.location, false, P.times(MV).times(this.mesh.localToWorld));
	gl.bufferData(gl.ARRAY_BUFFER, this.mesh.verts3, gl.STREAM_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, this.mesh.verts3.length / 3);

	gl.vertexAttrib4f(s.aColor.location, 0.2, 0.7, 0.0, 1.0);
	gl.uniformMatrix4fv(s.uMVP.location, false, P.times(MV).times(this.mesh.leaves1.localToWorld));
	gl.bufferData(gl.ARRAY_BUFFER, this.mesh.leaves1.verts3, gl.STREAM_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, this.mesh.leaves1.verts3.length / 3);

	gl.vertexAttrib4f(s.aColor.location, 0.1, 0.8, 0.1, 1.0);
	gl.uniformMatrix4fv(s.uMVP.location, false, P.times(MV).times(this.mesh.leaves2.localToWorld));
	gl.bufferData(gl.ARRAY_BUFFER, this.mesh.leaves2.verts3, gl.STREAM_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, this.mesh.leaves2.verts3.length / 3);

	gl.disableVertexAttribArray(s.aVertex.location);
	gl.deleteBuffer(vertsBuffer);
	delete vertsBuffer;

};

exports.prototype.mouse = function(x, y, isDown) {
	console.log(arguments);
}
