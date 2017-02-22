var ViewModel = function () {
	var self = this;
	
	this.answerId = 0;
    this.feedbackId = 0;
	
	this.task = ko.observable("");
	this.skipMsg = ko.observable("");
	this.correctAnswerMsg = ko.observable("");
	
	this.startFEN = ko.observable("");
	this.replay = ko.observable("");
	this.size = ko.observable("");
	this.editor = ko.observable(false);	
	this.playerOne = ko.observable("");
	this.playerTwo = ko.observable("");
	this.selectedConfig = ko.observable("");
	this.selectedDifficulty = ko.observable("");
	this.selectedPromotion = ko.observable("");
	this.selectedInteraction = ko.observable("");
	
	this.answerToAdd = ko.observable("");
    this.answers = ko.observableArray([]); 
	
	this.feedbackToAdd = ko.observable("");
    this.feedbacks = ko.observableArray([]); 
	
	this.adviceToAdd = ko.observable("");
    this.advices = ko.observableArray([]); 
	
	this.configs = ko.observableArray(ConfigurationManager.configList);
	
	this.collapseAnswerContainer = ko.observable(true);
	this.collapseFeedbackContainer = ko.observable(true);
	this.collapseAdviceContainer = ko.observable(true);
	this.collapseTaskContainer = ko.observable(true);
	this.collapseConfigContainer = ko.observable(true);
	
    this.addAnswer = function () {
        if ((this.answerToAdd() != "") && (this.answers.indexOf(this.answerToAdd()) < 0)){ // No duplicate
            this.answers.push({answer: this.answerToAdd(), correct: ko.observable(false), answerId: ko.observable(this.answerId++)});
		}
        this.answerToAdd("");
    };
	
	this.removeAnswer = function(answer) { self.answers.remove(answer) };
	
	this.addFeedback = function () {
        if ((this.feedbackToAdd() != "") && (this.feedbacks.indexOf(this.feedbackToAdd()) < 0)) // No duplicate
		var whenToApply = [];
            this.feedbacks.push({feedback: this.feedbackToAdd(), divVisible: ko.observable(false), feedbackId: ko.observable(this.feedbackId++)});
        this.feedbackToAdd("");
    };
 
    this.removeFeedback = function(feedback) { self.feedbacks.remove(feedback); };
	
	this.addAdvice = function () {
        if ((this.adviceToAdd() != "") && (this.advices.indexOf(this.adviceToAdd()) < 0)) // No duplicate
            this.advices.push({advice: this.adviceToAdd()});
        this.adviceToAdd("");
    };
 
    this.removeAdvice = function(advice) { self.advices.remove(advice) };
	
	this.createXml = function() {
		(new EditorXmlCreator(self)).create();
	}
	
	this.toggleAnswerCollapse = function(data, event) {
        this.collapseAnswerContainer(!this.collapseAnswerContainer());
		this.toggleButtonPlusMinus(event.target);
	}
	
	this.toggleFeedbackCollapse = function(data, event) {
        this.collapseFeedbackContainer(!this.collapseFeedbackContainer());
		this.toggleButtonPlusMinus(event.target);
	}
	
	this.toggleAdviceCollapse = function(data, event) {
        this.collapseAdviceContainer(!this.collapseAdviceContainer());
		this.toggleButtonPlusMinus(event.target);
	}
	
	this.toggleTaskCollapse = function(data, event) {
        this.collapseTaskContainer(!this.collapseTaskContainer());
		this.toggleButtonPlusMinus(event.target);
	}
	
	this.toggleConfigCollapse = function(data, event) {
        this.collapseConfigContainer(!this.collapseConfigContainer());
		this.toggleButtonPlusMinus(event.target);
	}
	
	this.toggleButtonPlusMinus = function(button){
		//button.innerHTML == "-" ? button.innerHTML = "+" : button.innerHTML = "-";
		button.innerHTML == "-" ? button.appendChild(document.createTextNode("+")) : button.appendChild(document.createTextNode("-"));
   		button.removeChild(button.firstChild);
	}	
	
	this.toggleButton = function(data, event) {
		var button = event.target;
		var labels = ["0","1","*"];
		var nextValue =	(labels.indexOf(button.value) + 1) % 3; 
		button.value = labels[nextValue];
		button.appendChild(document.createTextNode(button.value));
		button.removeChild(button.firstChild);
	}
};
 
ko.applyBindings(new ViewModel());
