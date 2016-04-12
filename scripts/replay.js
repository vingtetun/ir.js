'use strict';

function process(inBuffers, outBuffers) {
  let deferred = new Deferred();

  let scriptable = new ScriptableGraph('Tone', 80, function(leftBuffer, rightBuffer) {
    if (inBuffers.length() > outBuffers.length()) {
      outBuffers.push(leftBuffer, rightBuffer);
      return;
    }

    // There is enough data, let's disconnect the graph.
    scriptable.disconnect();

    // Apply changes to the buffers
    for (let i = 0; i < inBuffers.length(); i++) {

      for (let j = 0; j < inBuffers.left[i].length; j++) {
        if (inBuffers.left[i][j] < 0) {
          outBuffers.left[i][j] = 0;
        }
      }

      for (let j = 0; j < inBuffers.right[i].length; j++) {
        if (inBuffers.right[i][j] < 0) {
          outBuffers.right[i][j] = 0;
        }

        // Invert values
        outBuffers.right[i][j] *= -1;
      }
    }

    deferred.resolve();
  });

  return deferred.promise;
}

