(function($) {
	var JobStore = {};
	window.JobStore = JobStore;
	
	var template = function (name) {
        return $('#' + name + '-template').html();
    };

	JobStore.IndexView = Backbone.View.extend({
		render : function() {
			$.ajax('api/v1/companies',{
				method :'GET',
				success : function(data){
					$("#companies").empty();
					$("#companyView").empty();
					if(null != data){
						_.each(data.companies,function(company){
							console.log(company);
							var companyTemplate = template("company");
							var companyHTML = Mustache.to_html(companyTemplate, company);
                            $("#companies").append(companyHTML);
						});
					}
				}
			});
		}
	});
	
	JobStore.JobView = Backbone.View.extend({
		initialize : function(options){
			this.companyId = options.companyId;
		},
		render : function(){
			$("#companyView").empty();
			$("#companyView").html(Mustache.to_html(template("jobs"), {companyId:this.companyId}));
			$.ajax('api/v1/companies/'+this.companyId+'/jobs',{
				method : 'GET',
				success : function(data){
					if(null != data){
						_.each(data.jobs, function(json){
							var jobHTML = Mustache.to_html(template("job"), json);
                            $("#companyView").append(jobHTML);
						});
					}
				}
			});
		}
	});
	
	JobStore.CompanyFormView = Backbone.View.extend({
		el : $("body"),
		events :{
			'submit': 'saveCompany'
		},
		render : function(){
			$("#companyView").html(template("company-form"));
			return this;
		},
		
		saveCompany : function(event){
			console.log('in saveCompany()');
			event.preventDefault();
			var name = $('input[name=name]').val();
			var description = $('#description').val();
			var contactEmail = $('input[name=contactEmail]').val();
			var data = {
					name: name,
					description : description,
					contact_email: contactEmail
				};
			$.ajax({
			    type: "POST",
			    url: "api/v1/companies",
			    data: JSON.stringify(data),
			    contentType: "application/json; charset=utf-8",
			    dataType: "json",
			    success: function(data, textStatus, jqXHR){
			    	console.log(data);
			    	router.navigate("home",{trigger:true})
			    },
			    error: function(jqXHR, textStatus, errorThrown) {
			        console.log(jqXHR);
			        console.log(textStatus);
			        console.log(errorThrown);
			    }
			});
		}
	});
	
	JobStore.JobFormView = Backbone.View.extend({
		el : $("body"),
		
		initialize : function(options){
			this.companyId = options.companyId;
		},
		
		events :{
			'submit' : 'saveJob'
		},
		
		render : function(){
			$("#companyView").html(Mustache.to_html(template("jobs"), {companyId:this.companyId}));
			$("#companyView").append(template("job-form"));
			return this;
		},
		
		saveJob : function(event){
			console.log('in saveJob()');
			event.preventDefault();
			var title = $('input[name=title]').val();
			var description = $('#description').val();
			var data = {
					title: title,
					description : description
			};
			var that = this;
			$.ajax({
			    type: "POST",
			    url: "api/v1/companies/"+this.companyId+"/jobs",
			    data: JSON.stringify(data),
			    contentType: "application/json; charset=utf-8",
			    dataType: "json",
			    success: function(data, textStatus, jqXHR){
			    	console.log(data);
			    	router.navigate("companies/"+that.companyId+"/jobs",{trigger:true})
			    },
			    error: function(jqXHR, textStatus, errorThrown) {
			        console.log(jqXHR);
			        console.log(textStatus);
			        console.log(errorThrown);
			    }
			});
		}
		
	});

	JobStore.Router = Backbone.Router.extend({
		currentView : null,

		routes : {
			"" : "showAllCompanies",
			"home":"showAllCompanies",
			"companies/:companyId/jobs" : "listJobsForCompany",
			"companies/new":"newCompany",
			"companies/:companyId/jobs/new":"newJob"
		},

		changeView : function(view) {
			if (null != this.currentView) {
				this.currentView.undelegateEvents();
				this.currentView = null;
			}
			this.currentView = view;
			this.currentView.render();
		},

		showAllCompanies : function() {
			console.log("in showAllCompanies()...");
			this.changeView(new JobStore.IndexView());
		},

		listJobsForCompany : function(companyId) {
			console.log("in jobsForACompany()...");
			this.changeView(new JobStore.JobView({companyId : companyId}));
		},
		newCompany : function(){
			console.log("in newCompany()...");
			this.changeView(new JobStore.CompanyFormView());
		},
		
		newJob : function(companyId){
			console.log("in newJob()...");
			this.changeView(new JobStore.JobFormView({companyId : companyId}));
		}
	});

	var router = new JobStore.Router();
	Backbone.history.start();

})(jQuery);