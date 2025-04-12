Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://127.0.0.1:5000/classify_image";

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            let players = ["cristiano_ronaldo", "erling_haaland", "jude_bellingham", "kevin_de_bruyne", "kylian_mbappe", "lionel_messi", "neymar_jr", "robert_lewandowski", "sergio_ramos", "zlatan_ibrahimovic"];
            
            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").empty().show();
                $("#divClassTable").show();
            
                let maxScores = {};
                let averageScores = {};
                let countScores = {}; // For averaging
                let totalFaces = data.length;
            
                for (let i = 0; i < data.length; ++i) {
                    let detectedFace = data[i];
            
                    // Clone and show player card
                    let playerCard = $(`[data-player="${detectedFace.class}"]`).clone();
                    $("#resultHolder").append(playerCard);
            
                    let classDictionary = detectedFace.class_dictionary;
                    let classProbabilities = detectedFace.class_probability;
            
                    for (let personName in classDictionary) {
                        let index = classDictionary[personName];
                        let probabilityScore = classProbabilities[index];
            
                        // Track max score
                        if (!maxScores[personName] || probabilityScore > maxScores[personName]) {
                            maxScores[personName] = probabilityScore;
                        }
            
                        // Sum for average
                        if (!averageScores[personName]) {
                            averageScores[personName] = probabilityScore;
                            countScores[personName] = 1;
                        } else {
                            averageScores[personName] += probabilityScore;
                            countScores[personName] += 1;
                        }
                    }
                }
            
                // Compute final averages
                for (let personName in averageScores) {
                    averageScores[personName] = averageScores[personName] / countScores[personName];
                }
            
                // Update table
                for (let personName in maxScores) {
                    let maxScore = maxScores[personName].toFixed(3);
                    let avgScore = averageScores[personName].toFixed(3);
            
                    let elementName = "#score_" + personName;
                    $(elementName).html(maxScore);
                    $(elementName).attr('title', `Avg. Score: ${avgScore}`);
                }
            }            
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});