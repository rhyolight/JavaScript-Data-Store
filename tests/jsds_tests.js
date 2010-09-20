YUI().add('jsds_tests', function(Y) {

	var suite = new Y.Test.Suite("JSDS_Suite"),
		a = Y.Assert,
		aa = Y.ArrayAssert;

	suite.add(new Y.Test.Case({
	
		name : "JSDS static tests",
		
		tearDown: function() {
			JSDS.clear();
		},
		
		testCreateStore: function () {
			var store = JSDS.create('store1');
			
			a.isNotUndefined(store, 'create returned undefined');
			a.isNotUndefined(store.id, 'new store has no id');
			a.areEqual('store1', store.id, 'wrong id was returned');
			
			var store2 = JSDS.create('store2');
			
			a.areNotSame(store, store2, 'stores created should not be same obj');
			a.isNotUndefined(store2, 'create returned undefined');
			a.isNotUndefined(store2.id, 'new store has no id');
			a.areEqual('store2', store2.id, 'new store returned wrong id');
		},
		
		testGetCreatedStore: function() {
			JSDS.create('my_store');
			a.isNotUndefined(JSDS.get('my_store'));
		},
		
		testCreatingPreExistingStoreThrowsException: function() {
			var exceptionThrown = false;
			JSDS.create('happy');
			try {
				JSDS.create('happy');
			} catch (e) {
				a.isNotNull(e, 'exception was null');
				a.areEqual('Cannot overwrite existing data store "happy"!', e.message);
				exceptionThrown = true;
			}
			a.isTrue(exceptionThrown, 'Overwrote existing store without exception');
		},
		
		testStoreCreationWithoutIdentifier: function() {
			var jsds = JSDS.create();
			var id = jsds.id;
			a.isNotNull(id, 'generated id was null');
		},
		
		testGetStoreCount: function() {
			var i=0;
			for (;i<100;i++) {
				JSDS.create();
			}
			
			a.areEqual(100, JSDS.count());
		},
		
		testGetStoreIds: function() {
		    JSDS.create('a');
		    JSDS.create('b');
		    JSDS.create('c');
		    
		    var result = JSDS.ids();
		    
		    a.isArray(result, 'ids were not array');
		    a.areEqual(3, result.length, 'ids array wrong size');
		    aa.contains('a', result, 'missing id!');
		    aa.contains('b', result, 'missing id!');
		    aa.contains('c', result, 'missing id!');
		}
		
	}));
	
	suite.add(new Y.Test.Case({

		name : "JSDS instance tests",
		s: null,

		setUp : function () {
			this.s = JSDS.create('store');
		},
		
		tearDown : function () {
			this.s.remove();
			delete this.s;
		},
		
		testStoreStringValue: function () {
			this.s.store('city', 'Cupertino');
			var storedValue = this.s.get('city');
			
			a.isNotUndefined(storedValue, 'stored value cannot be undefined');
			a.areEqual('Cupertino', storedValue, 'got back wrong stored value');
			
			this.s.store('city', 'San Jose');
			storedValue = this.s.get('city');
		
			a.areEqual('San Jose', storedValue, 'got back wrong stored value after reassignment');
		},
		
		testStoreNumberValue: function () {
			this.s.store('price', 5.55);
			var storedValue = this.s.get('price');
			
			a.isNotUndefined(storedValue, 'stored value cannot be undefined');
			a.areEqual(5.55, storedValue, 'got back wrong stored value');
			
			this.s.store('price', 3.14);
			storedValue = this.s.get('price');
		
			a.areEqual(3.14, storedValue, 'got back wrong stored value after reassignment');
		},
		
		testStoreObjectValue: function() {
			var chicken = {
				name: 'Susie', eggs: 3, farm:'Hillsboro Farms'
			};
			this.s.store('chicken', chicken);
			
			var gotChicken = this.s.get('chicken');
			
			a.areSame(chicken, gotChicken, 'retrieved value is not same as set value');
			
			a.areEqual('Susie', this.s.get('chicken.name'));
			a.areEqual(3, this.s.get('chicken', 'eggs'));
		},
		
		testUpdatingDoesntClobberExistingData: function() {
		    var chicken = {
				name: 'Susie', eggs: 3, farm:'Hillsboro Farms'
			};
			this.s.store('chicken', chicken);
			
			var newchick = { eggs: 4};
			
			a.areEqual('Susie', this.s.get('chicken.name'));
			a.areEqual(3, this.s.get('chicken', 'eggs'));
			
			this.s.store('chicken', newchick, {update: true});
			
			a.areEqual(4, this.s.get('chicken', 'eggs'));
			a.areEqual('Susie', this.s.get('chicken.name'));
			a.areEqual('Hillsboro Farms', this.s.get('chicken.farm'));
		},
		
		testUpdatingDoesntClobberExistingData_DeepStructure: function() {
		    var val = {
				animals: {
					reptiles: {
						turtles: ['Victor']
					},
					mammals: {
						primates: {
							humans: {
								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
							}
						},
						dogs: ['Sasha', 'Ann-Marie']
					}
				}
			};
			
			this.s.store('stuff', val);
			
			var newVal = {
				animals: {
					reptiles: {
						lizards: ['Izzy']
					},
					mammals: {
						primates: {
							humans: {
								Simpsons: ['Homer', 'Bart', 'Marge', 'Lisa', 'Maggie']
							}
						},
						dogs: ['Scooby']
					}
				}
			};
			
			this.s.store('stuff', newVal, { update: true });
			
			var result = this.s.get('stuff.animals.reptiles.turtles');
			a.isArray(result, 'result should have been an array');
			a.areEqual(1, result.length, 'result should have length of 1');
			a.areEqual('Victor', result[0]);

			result = this.s.get('stuff.animals.reptiles.lizards');
			a.isArray(result, 'result should have been an array');
			a.areEqual(1, result.length, 'result should have length of 1');
			a.areEqual('Izzy', result[0]);
			
			result = this.s.get('stuff.animals.mammals.primates.humans');
			a.isObject(result, 'result should have been an object');
			a.isNotUndefined(result.Taylors, 'old value was clobbered: "Taylors"');
			a.areEqual(4, result.Taylors.length, 'result should have length of 4');
			a.isNotUndefined(result.Simpsons, 'new value was not added: "Simpsons"');
			a.areEqual(5, result.Simpsons.length, 'result should have length of 5');
			a.areEqual('Matt', result.Taylors[0]);
			a.areEqual('Romy', result.Taylors[3]);
			a.areEqual('Homer', result.Simpsons[0]);
			a.areEqual('Lisa', result.Simpsons[3]);
			
			result = this.s.get('stuff.animals.mammals.dogs');
			a.isArray(result, 'result should have been array');
			a.areEqual(3, result.length, 'array should have 3 dogs');
			aa.contains('Scooby', result);
			aa.contains('Sasha', result);
			aa.contains('Ann-Marie', result);
		},
		
		testUpdatingArrays_DoesntClobberExistingValues: function() {
		    this.s.store('arr', ['one','two','three']);
		    
		    this.s.store('arr', ['red'], {update: true});
		    
		    var res = this.s.get('arr');
		    
		    a.isArray(res, 'result was not array');
		    aa.contains('one', res);
		    aa.contains('two', res);
		    aa.contains('three', res);
		},

		testUpdatingArrays_AddsNewValuesToEndOfArray: function() {
		    this.s.store('arr', ['one','two','three']);
		    
		    this.s.store('arr', ['red'], {update: true});
		    
		    var res = this.s.get('arr');
		    
		    a.isArray(res, 'result was not array');
		    a.areEqual(4, res.length);
		    aa.contains('red', res);
		},

		testUpdatingArrays_DoesntDuplicateArrayValues: function() {
		    this.s.store('arr', ['one','two','three']);
		    
		    this.s.store('arr', ['red', 'two'], {update: true});
		    
		    var res = this.s.get('arr');
		    
		    a.isArray(res, 'result was not array');
		    a.areEqual(4, res.length);
		    aa.contains('red', res);
		    aa.contains('one', res);
		    aa.contains('two', res);
		    aa.contains('three', res);
		},

        testStoreReturnsPreviousValue: function() {
			this.s.store('city', 'Cupertino');
			var prev = this.s.store('city', 'San Jose');
			
			a.areEqual('Cupertino', prev, 'Wrong stored value');
		},
		
		testStoreReturnsUndefinedWhenStoringFirstValue: function() {
			var result = this.s.store('pig', 'Fluffy');

			a.isUndefined(result, 'store returned a value on initial store');
		},
		
		testStoreReturnsOldValueWhenStoringAnotherValue: function() {
			this.s.store('pig', 'Fluffy');
			var result = this.s.store('pig', 'Orson');

			a.areEqual('Fluffy', result, 'store should have returned the old value');
		},
		
		testNamespaceStorage_CombinedDots: function() {
			this.s.store('people', {males: ['Dean', 'Matt']});
			var result = this.s.get('people.males');
			
			a.isArray(result, 'result should have been an array');
			a.areEqual(2, result.length, 'result should have length of 2');
			a.areEqual('Dean', result[0]);
			a.areEqual('Matt', result[1]);
		},
		
		testNamespaceStorage_SeparatedNoDots: function() {
			this.s.store('people', {males: ['Dean', 'Matt']});
			var result = this.s.get('people', 'males');
			
			a.isArray(result, 'result should have been an array');
			a.areEqual(2, result.length, 'result should have length of 2');
			a.areEqual('Dean', result[0]);
			a.areEqual('Matt', result[1]);
		},
		
		testNamespaceStorage_CombinedDots_Deep: function() {
			var val = {
				animals: {
					reptiles: {
						turtles: ['Victor']
					},
					mammals: {
						primates: {
							humans: {
								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
							}
						},
						dogs: ['Sasha', 'Ann-Marie']
					}
				}
			};
			
			this.s.store('stuff', val);
			
			var result = this.s.get('stuff');
			
			a.isObject(result, 'result should have been an object');
			
			result = this.s.get('stuff.animals.reptiles.lizards');
			a.isUndefined(result, 'query for lizards should be undefined');
			
			result = this.s.get('stuff', 'animals', 'reptiles', 'turtles');
			a.isArray(result, 'result should have been an array');
			a.areEqual(1, result.length, 'result should have length of 1');
			a.areEqual('Victor', result[0]);
			
			result = this.s.get('stuff', 'animals', 'mammals', 'primates', 'humans');
			
			a.isObject(result, 'result should have been an object');
			a.areEqual(4, result.Taylors.length, 'result should have length of 4');
			a.areEqual('Matt', result.Taylors[0]);
			a.areEqual('Romy', result.Taylors[3]);
		},
		
		testNamespaceStorage_SeparatedNoDots_Deep: function() {
			var val = {
				animals: {
					reptiles: {
						turtles: ['Victor']
					},
					mammals: {
						primates: {
							humans: {
								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
							}
						},
						dogs: ['Sasha', 'Ann-Marie']
					}
				}
			};
			
			this.s.store('stuff', val);
			
			var result = this.s.get('stuff');
			
			a.isObject(result, 'result should have been an object');
			
			result = this.s.get('stuff.animals.reptiles.turtles');
			a.isArray(result, 'result should have been an array');
			a.areEqual(1, result.length, 'result should have length of 1');
			a.areEqual('Victor', result[0]);
			
			result = this.s.get('stuff.animals.mammals.primates.humans');
			
			a.isObject(result, 'result should have been an object');
			a.areEqual(4, result.Taylors.length, 'result should have length of 4');
			a.areEqual('Matt', result.Taylors[0]);
			a.areEqual('Romy', result.Taylors[3]);
		},
		
		testNamespaceStorage_COMBO_Deep: function() {
			var val = {
				animals: {
					reptiles: {
						turtles: ['Victor']
					},
					mammals: {
						primates: {
							humans: {
								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
							}
						},
						dogs: ['Sasha', 'Ann-Marie']
					}
				}
			};
			
			this.s.store('stuff', val);
			
			var result = this.s.get('stuff');
			
			a.isObject(result, 'result should have been an object');
			
			result = this.s.get('stuff.animals', 'reptiles.turtles');
			a.isArray(result, 'result should have been an array');
			a.areEqual(1, result.length, 'result should have length of 1');
			a.areEqual('Victor', result[0]);
			
			result = this.s.get('stuff', 'animals.mammals.primates' , 'humans');
			
			a.isObject(result, 'result should have been an object');
			a.areEqual(4, result.Taylors.length, 'result should have length of 4');
			a.areEqual('Matt', result.Taylors[0]);
			a.areEqual('Romy', result.Taylors[3]);
		},
		
		testStoreIntoNonExistantNamespace: function() {
			this.s.store('stuff.test', 'pygmies');
			var result = this.s.get('stuff', 'test');
			a.areEqual('pygmies', result);
		},
		
		testStoreReturnsPreviousValue_FromNestedNamespace: function() {
			this.s.store('stuff.test', 'pygmies');
			var old = this.s.store('stuff.test', 'kidneys');
			a.areEqual('pygmies', old);
		},
		
		testClear: function() {
			this.s.store('stuff', 'frogs');
			a.areEqual('frogs', this.s.get('stuff'));
			this.s.clear();
			a.isUndefined(this.s.get('stuff'));
		},
		
		testDelete: function() {
			var soonDeleted = JSDS.create('removeme');
			soonDeleted.remove();
			a.isUndefined(JSDS._stores['removeme']);
		},
		
		testStoreHugeTextBlob: function() {
			var blob = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> <br/><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"> <br/>  <head> <br/>	<meta http-equiv="X-UA-Compatible" content="IE=8"> <br/>	<script type="text/javascript"> <br/>//<![CDATA[<br/>var matches,url,path,domain;url=document.location.toString();try{domain=url.match(/https?:\/\/[^\/]+/);if(matches=url.match(/(.+?)#(.+)/)){url=matches[1];path=matches[2];if(path){var arr=path.split(/\?/);path=arr[0];var params=arr[1];path=path.replace(/^\//,"");var redirect_url=[domain,path].join("/");if(params){redirect_url=[redirect_url,params].join("?")}document.location=redirect_url}}}catch(err){};<br/>//]]><br/></script>	<script type="text/javascript"> <br/>//<![CDATA[<br/>var page={};var onCondition=function(D,C,A,B){D=D;A=A?Math.min(A,5):5;B=B||100;if(D()){C()}else{if(A>1){setTimeout(function(){onCondition(D,C,A-1,B)},B)}}};<br/>//]]><br/></script> <br/>	<meta content="text/html; charset=utf-8" http-equiv="Content-Type" /> <br/><meta content="en-us" http-equiv="Content-Language" /> <br/><meta content="Twitter is without a doubt the best way to share and discover what is happening right now." name="description" /> <br/><meta content="no" http-equiv="imagetoolbar" /> <br/><meta content="width = 780" name="viewport" /> <br/><meta content="4FTTxY4uvo0RZTMQqIyhh18HsepyJOctQ+XTOu1zsfE=" name="verify-v1" /> <br/><meta content="1" name="page" /> <br/><meta content="NOODP" name="robots" /> <br/><meta content="y" name="session-loggedin" /> <br/><meta content="6797182" name="session-userid" /> <br/><meta content="rhyolight" name="session-user-screen_name" /> <br/>	<title id="page_title">Twitter / Home</title> <br/>	<link href="http://a1.twimg.com/a/1279322210/images/favicon.ico" rel="shortcut icon" type="image/x-icon" /> <br/><link href="http://a1.twimg.com/a/1279322210/images/twitter_57.png" rel="apple-touch-icon" /> <br/><link rel="alternate" href="http://twitter.com/statuses/friends_timeline.rss" title="Your Twitter Timeline" type="application/rss+xml" /> <br/><link rel="alternate" href="http://twitter.com/statuses/replies.rss" title="Your Twitter @rhyolight Mentions" type="application/rss+xml" /> <br/><link rel="alternate" href="http://twitter.com/favorites/6797182.rss" title="Your Twitter Favorites" type="application/rss+xml" /> <br/> <br/>	<br/>	<link href="http://a3.twimg.com/a/1279322210/stylesheets/twitter.css?1279326324" media="screen" rel="stylesheet" type="text/css" /> <br/><link href="http://a3.twimg.com/a/1279322210/stylesheets/geo.css?1279326324" media="screen" rel="stylesheet" type="text/css" /> <br/><link href="http://a0.twimg.com/a/1279322210/stylesheets/buttons_new.css?1279326324" media="screen" rel="stylesheet" type="text/css" /> <br/>		<style type="text/css"> <br/>	  <br/>		body {<br/>  background: #022330 url(\'http://a1.twimg.com/profile_background_images/55715982/ornate_small1.png\') fixed repeat;<br/> <br/>}<br/> <br/>body#show #content .meta a.screen-name,<br/>#content .shared-content .screen-name,<br/>#content .meta .byline a {<br/>  color: #0084B4;<br/>}<br/> <br/>/* Link Color */<br/>a,<br/>#content tr.hentry:hover a,<br/>body#profile #content div.hentry:hover a,<br/>#side .stats a:hover span.stats_count,<br/>#side div.user_icon a:hover,<br/>li.verified-profile a:hover,<br/>#side .promotion .definition strong,<br/>p.list-numbers a:hover,<br/>#side div.user_icon a:hover span,<br/>#content .tabMenu li a,<br/>.translator-profile a:hover,<br/>#local_trend_locations li a,<br/>.modal-content .list-slug,<binput id="tab_action" name="tab" type="hidden" value="index" /> <br/>  <fieldset class="common-form standard-form"> <br/>	<div class="bar"> <br/>	  <h3><label for="status" class="doing">What&rsquo;s happening?</label></h3> <br/>	  <span id="chars_left_notice" class="numeric"> <br/>		<strong id="status-field-char-counter" class="char-counter"></strong> <br/>	  </span> <br/>	</div> <br/>	<div class="info"> <br/>	  <textarea cols="40" rows="2" id="status" name="status" accesskey="u" autocomplete="off" tabindex="1"></textarea> <br/>	  <div id="tweeting_controls"> <br/>		<a href="#" tabindex="2" id="tweeting_button" class="a-btn a-btn-m"><span>Tweet</span></a> <br/>	  </div> <br/>			<div class="status-btn" style="display:none"> <br/>		<input type="submit" name="update" value="update" id="update-submit" class="status-btn round-btn" tabindex="2" /> <br/>	  </div> <br/>	  <div id="update_notifications"> <br/>				  <div id="geo_status" class="position_container"></div> <br/>				<br/>		  <div id="latest_status"> <br/>			<span id="latest_status"><span id="latest_text"><span class="status-text"></span><span id="latest_meta" class="entry-meta">&nbsp;about 1 hour ago</span></span><span id="latest_text_full"><strong>Latest: </strong><span class="status-text">@<a class="tweet-url username" href="/michaelg" rel="nofollow">michaelg</a> Not to mention The Atomic Bitchwax, High on Fire, Baroness, Shrinebuilder, Orange Goblin, etc.</span> <br/>	  <span class="entry-meta"> <br/>		<a href="http://twitter.com/rhyolight/status/18943593462" class="entry-date" rel="bookmark"><span class="published" title="2010-07-19T21:09:54+00:00">about 1 hour ago</span></a>&nbsp;<span>from <a href="http://mowglii.com/itsy" rel="nofollow">Itsy!</a></span><a href="http://twitter.com/michaelg/status/18943009920">&nbsp;in reply to michaelg</a> <br/>	</span> <br/>  </span></span> <br/> <br/> <br/>		  </div> <br/>		<br/>	  </div> <br/>	  <div class="clear"></div> <br/>	</div> <br/>  </fieldset> <br/></form> <br/> <br/>		</div> <br/><div id="dm_update_box"><form action="/direct_messages" class="status-update-form" id="direct_message_form" method="post"><div style="margin:0;padding:0"><input name="authenticity_token" type="hidden" value="15874bb0ca09aa5b5ede1513c9188238cd718943" /></div>  <fieldset class="common-form standard-form"> <br/>	<div class="bar"> <br/>	  <h3> <br/>		<label for="doing"> <br/>		  Send <select name="user[id]" id="direct_message_user_id" accesskey=">" tabindex="3"></select> a direct message.<br/>		</label> <br/>	  </h3> <br/>	  <span id="chars_left_notice" class="numeric"> <br/>		<strong id="status-field-char-counter" class="char-counter"></strong> <br/>	  </span> <br/>	</div> <br/>	<div class="info"> <br/>	  <textarea accesskey="u" autocomplete="off" cols="15" id="text" name="text" rows="3" tabindex="4"></textarea> <br/>	</div> <br/>	<div class="status-btn"> <br/>	  <input type="submit" name="update" value="send" id="dm-submit" class="round-btn dm-btn" tabindex="4" /> <br/>	  <input id="direct_message_screen_name" name="screen_name" type="hidden" value="" /> <br/>	  <input id="tab_action" name="tab" type="hidden" value="index" /> <br/>	</div> <br/>  </fieldset> <br/></form> <br/></div> <br/> <br/><div id="user_search_results" class="section onebox_users"> <br/>  <h2>Name results for <strong></strong></h2> <br/>  <p class="seeall"><a href="#">View all name search results &raquo;</a></p> <br/>  <ul /> <br/></div> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/><div class="section"> <br/>  <br/> <br/>  <br/> <br/>  <div id="timeline_heading"> <br/>	<h1 id="heading"><span id="title">Home</span></h1> <br/>	<div id="geo_place_details"> <br/>  <br/></div> <br/> <br/> <br/>	<ul id="dm_tabs" class="tabMenu"> <br/>	  <li id="inbox_tab"><a href="http://twitter.com/inbox" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;inbox&quot;}"><span>Inbox</span></a></li> <br/>	  <li id="sent_tab"><a href="http://twitter.com/sent" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;sent&quot;}"><span>Sent</span></a></li> <br/>	</ul> <br/> <br/>	<br/> <br/>		  <ul id="retweet_tabs" class="tabMenu"> <br/>		<li id="retweets_by_others_tab"><a href="http://twitter.com/retweets_by_others" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;retweets_by_others&quot;}"><span>Retweets by others</span></a></li> <br/>		<li id="retweets_tab"><a href="http://twitter.com/retweets" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;retweets&quot;}"><span>Retweets by you</span></a></li> <br/>		<li id="retweeted_of_mine_tab"><a href="http://twitter.com/retweeted_of_mine" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;retweeted_of_mine&quot;}"><span>Your tweets, retweeted</span></a></li> <br/>	  </ul> <br/>	  </div> <br/> <br/>  <div class="trend-description-container"> <br/>	<div id="trend_descriptionlabel class="title">Description</label> <br/>	  <textarea id="list_description" name="list[description]" class="list-description title" maxlength="100"></textarea> <br/>	  <div class="list-description-instruction">Under 100 characters, optional</div> <br/>	</fieldset> <br/>	<fieldset class=\'clear bottom\'> <br/>	  <label class="title">Privacy</label> <br/>	  <div class="options"> <br/>		<label class="radio"><input type="radio" name="list[mode]" value="0" checked="checked" /> <strong>Public</strong> &mdash; Anyone can subscribe to this list.</label> <br/>		<label class="radio"><input type="radio" name="list[mode]" value="1" /> <strong>Private</strong> &mdash; Only you can access this list.</label> <br/>	  </div> <br/>	  <div class="private-warning"> <br/>		<strong>Are you sure?</strong> <br/>		<p>Switching your list from public to private will remove all of its subscribers.</p> <br/>	  </div> <br/>	</fieldset> <br/>	<input id="authenticity_token" name="authenticity_token" type="hidden" value="15874bb0ca09aa5b5ede1513c9188238cd718943" /> <br/>	<input type="submit" class="btn create-list-button submit" value="Create list" /> <br/>	<input type="submit" class="btn update-list-button submit" value="Update list" /> <br/>	<input type="hidden" class="list-member-id" name="list[member][id]" /> <br/>	<input type="hidden" class="list-slug-field" name="list[slug]" /> <br/>  </form> <br/>  </div> <br/></div> <br/> <br/><h2 id="list_dialog_header" style="display: none;"> <br/>  <span class="create-list-heading">Create a new list</span> <br/>  <span class="update-list-heading">Update this list</span> <br/></h2> <br/> <br/><div id="list_no_members_owner" style="display: none;"> <br/>  <div class="no-members"> <br/>  <h3>Find people to add to your list:</h3> <br/>  <form action="http://twitter.com/search/users" method="get">  <fieldset class="common-form"> <br/>				<input class="medium" id="q" name="q" type="text" />	  <input type="hidden" name="category" value="people" /> <br/>	  <input type="hidden" name="source" value="users" /> <br/>	  <input class="submit btn" id="search_users_submit" type="submit" value="search" />	  <p class="instruction">Search for a username, first or last name, business or brand</p> <br/>			</fieldset> <br/></form>  <p class="tip">You can also add people from your <a href="/following">Following</a> page or anyone’s profile page.</p> <br/></div> <br/></div> <br/><div id="list_no_members" style="display: none;"> <br/>  <p class="no-members">This list doesn’t follow any users yet. It probably will soon, though.</p> <br/> <br/></div> <br/> <br/>  <br/> <br/>				  </div> <br/>								</td> <br/>			  <br/>			</tr> <br/>		  </tbody> <br/>		</table> <br/>	  <br/> <br/>	  <br/>  <div id="footer" class="round"> <br/>	  <h3 class="offscreen">Footer</h3> <br/>	  <br/>	  <br/>	  <ul class="footer-nav"> <br/>		  <li class="first">&copy; 2010 Twitter</li> <br/>		  <li><a href="/about">About Us</a></li> <br/>		  <li><a href="/about/contact">Contact</a></li> <br/>		  <li><a href="http://blog.twitter.com">Blog</a></li> <br/>		  <li><a href="http://status.twitter.com">Status</a></li> <br/>					  <li><a href="/goodies">Goodies</a></li> <br/>					<li><a href="http://dev.twitter.com/">API</a></li> <br/>					  <li><a href="http://business.twitter.com/twitter101">Business</a></li> <br/>					<li><a href="http://support.twitter.com">Help</a></li> <br/>		  <li><a href="/jobs">Jobs</a></li> <br/>		  <li><a href="/tos">Terms</a></li> <br/>		  <li><a href="/privacy">Privacy</a></li> <br/>	  </ul> <br/>  </div> <br/> <br/> <br/> <br/>	  <hr /> <br/> <br/>	</div> <br/> <br/>	<br/> <br/>	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.0/jquery.min.js" type="text/javascript"></script> <br/><script src="http://a2.twimg.com/a/1279322210/javascripts/twitter.js?1279326324" type="text/javascript"></script> <br/><script src="http://a1.twimg.com/a/1279322210/javascripts/lib/jquery.tipsy.min.js?1279326324" type="text/javascript"></script> <br/><script type=\'text/javascript\' src=\'http://www.google.com/jsapi\'></script> <br/><script src="http://a0.twimg.com/a/1279322210/javascripts/lib/gears_init.js?1279326324" type="text/javascript"></script> <br/><script src="http://a1.twimg.com/a/1279322210/javascripts/lib/mustache.js?1279326324" type="text/javascript"></script> <br/><script src="http://a2.twimg.com/a/1279322210/javascripts/geov1.js?1279326324" type="text/javascript"></script> <br/><script src="http://a0.twimg.com/a/1279322210/javascripts/api.js?1279326324" type="text/javascript"></script> <br/>  <script src="http://a1.twimg.com/a/1279322210/javascripts/lib/mustache.js?1279326324" type="text/javascript"></script> <br/><script src="http://a2.twimg.com/a/1279322210/javascripts/dismissable.js?1279326324" type="text/javascript"></script> <br/>  <br/>	<script src="http://a0.twimg.com/a/1279322210/javascripts/api.js?1279326324" type="text/javascript"></script> <br/><script src="http://a3.twimg.com/a/1279322210/javascripts/controls.js?1279326324" type="text/javascript"></script> <br/><script src="http://a0.twimg.com/a/1279322210/javascripts/hover_cards.js?1279326324" type="text/javascript"></script> <br/>  <br/> <br/><script type="text/javascript"> <br/>//<![CDATA[<br/>  page.query = \'\';<br/>  page.prettyQuery = \'\';<br/>  <br/>  page.locale = \'en\';<br/>  <br/>	page.showSS = true;<br/>  <br/>	  page.controller_name = \'TimelineController\';<br/>	  page.action_name = \'home\';<br/>	  twttr.form_authenticity_token = \'15874bb0ca09aa5b5ede1513c9188238cd718943\';<br/>	  $.ajaxSetup({ data: { authenticity_token: \'15874bb0ca09aa5b5ede1513c9188238cd718943\' } });<br/> <br/>	  // FIXME: Reconcile with the kinds on the Status model.<br/>	  twttr.statusKinds = {<br/>		UPDATE: 1,<br/>		SHARE: 2<br/>	  };<br/>	  twttr.ListPerUserLimit = 20;<br/> <br/>	  <br/> <br/>	<br/>//]]><br/></script> <br/><script type="text/javascript"> <br/>//<![CDATA[<br/> <br/>	  $( function () {<br/>		$(\'#latest_status\').isCurrentStatus();<br/>	  (function() {<br/>	  <br/>		twttr.geo.IP = \'209.131.62.113\';<br/>	  <br/>		setTimeout(function() {<br/>		  $.extend(twttr.geo.options, {<br/>			more_places: true,<br/>			autocomplete: true,<br/>			autocomplete_zero_delay: false,<br/>			place_creation: true,<br/>			place_creation_needs_high_accuracy: false,<br/>			allow_set_location_manually: true,<br/>			show_place_details_in_map: true,<br/>			show_similar_places: true,<br/>			nearby_activity: false<br/>		  });<br/>		  new twttr.geo.UpdateUi({<br/>			geo_enabled: true,<br/>			has_dismissed_geo_promo: false,<br/>			current_user_path: "/users/6797182",<br/>			granularity: "poi",<br/>			avatarUrl: "http://a3.twimg.com/profile_images/655350303/rhyolight_big_mini.jpg"<br/>		  });<br/>		}, 0);<br/>	  })();<br/>	  $(\'#direct_message_form\').isDirectMessageForm();<br/>  <br/>	if (!($.browser.mshttp://www.");<br/>	document.write(unescape("%3Cscript src=\'" + gaJsHost + "google-analytics.com/ga.js\' type=\'text/javascript\'%3E%3C/script%3E"));<br/>  </script> <br/> <br/>  <script type="text/javascript"> <br/> <br/>	try {<br/>	  var pageTracker = _gat._getTracker("UA-30775-6");<br/>	  pageTracker._setDomainName("twitter.com");<br/>			pageTracker._setVar(\'Logged In\');<br/>			pageTracker._setVar(\'lang: en\');<br/>			pageTracker._initData();<br/>					<br/>		  pageTracker._trackPageview(\'/home\');<br/>				  } catch(err) { }<br/> <br/>  </script> <br/> <br/>  <!-- END google analytics --> <br/> <br/> <br/> <br/> <br/>	<div id="notifications"></div> <br/> <br/> <br/>	<br/> <br/>	<br/>  <br/> <br/> <br/>  </body> <br/> <br/></html>';
			
			this.s.store('blob', blob);
			
			a.areSame(blob, this.s.get('blob'));
		}
		
	}));
	
	
	suite.add(new Y.Test.Case({
	
		name : "JSDS event tests",
		s: null,

		setUp : function () {
			this.s = JSDS.create('testStore');
		},
		
		tearDown : function () {
			JSDS.clear();
		},
		
		test_OnStore_CallbackIsCalled: function () {
			var called = false;
			this.s.on('store', function() {
				called = true;
			});
			
			this.s.store('mama', 'mia');
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_OnStore_CallbackIsPassedTypeOfEvent: function() {
			var called = false;
			this.s.on('store', function(type) {
				called = true;
				a.areEqual('store', type, 'Wrong event type');
			});
			
			this.s.store('mama', 'mia');
			
			a.isTrue(called, 'callback for on store event never called');			
		},
		
		test_OnStore_CallbackIsPassedStoreId: function() {
			var called = false;
			this.s.on('store', function(type, args) {
				called = true;
				a.isNotUndefined(args.id, 'store id given to callback was undefined');
				a.areEqual('testStore', args.id, 'Wrong store id');
			});
			
			this.s.store('mama', 'mia');
			
			a.isTrue(called, 'callback for on store event never called');			
		},
		
		test_onStoreEvent_PassesStringStoreValue: function() {
			var called = false;
			this.s.on('store', function(type, args) {
				called = true;
				a.areEqual('mia', args.value, 'on store callback passed wrong value');
			});
			
			this.s.store('mama', 'mia');
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_onStoreEvent_PassesStringStoreValue_WhenDeeper: function() {
			var called = false;
			this.s.on('store', function(type, args) {
				called = true;
				a.areEqual('abba', args.value, 'on store callback passed wrong value');
			});
			
			this.s.store('mama.mia', 'abba');
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_onStoreEventWithKey_PassesObjectStoreValue: function() {
			var called = false;
			
			this.s.on('store', {
			    key: 'one',
			    callback: function(type, args) {
    				called = true;
    				a.areEqual('Phoenix', args.value, 'on store callback passed wrong value');
    			}
			});
			
			this.s.store('one', 'Phoenix');
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_onStoreEventWithDifferentKey_NeverCalled: function() {
			var called = false;
			
			this.s.on('store', {
			    key: 'one',
			    callback: function(type, args) {
    				called = true;
    			}
			});
			
			this.s.store('two', 'Phoenix');
			
			a.isFalse(called, 'callback for on store should not have been called');
		},
		
		test_onStoreEvent_forSecondDeepKey_PassesObjectStoreValue: function() {
			var called = false;
			
			this.s.on('store', {
			    key: 'one.two',
			    callback: function(type, args) {
    				called = true;
    				a.areEqual('Phoenix', args.value, 'on store callback passed wrong value');
    			}
			});
			
			this.s.store('one.two', 'Phoenix');
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_onStoreEvent_forShallowKey_PassesObjectStoreValue: function() {
			var called = false;
			
			this.s.on('store', {
			    key: 'one',
			    callback: function(type, args) {
    				called = true;
    				a.isString(args.value.two);
    				a.areEqual('Phoenix', args.value.two, 'on store callback passed wrong value');
    			}
			});
			
			this.s.store('one.two', 'Phoenix');
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_onStoreEvent_PassesProperNestedValue_NotEntireStore: function() {
			var called = false;
			this.s.on('store', {
			    key: 'one.two.three',
			    callback: function(type, args) {
    				called = true;
    				a.areEqual('the value', args.value, 'on store callback passed wrong value');
    			}
			});
			
			this.s.store('one', {two:{three:'the value'}}, {update: true});
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_On_Function_CanBePassed_Options: function() {
			var called = false;
			var fakeScope = {};
			this.s.on('store', {
				callback: function(type, args) {
					called = true;
    				a.areEqual('mama', args.key, 'on store callback passed wrong key');
					a.areEqual('mia', args.value, 'on store callback passed wrong value');
					a.areSame(fakeScope, this, 'bad scope');
				},
				scope: fakeScope
			});
			
			this.s.store('mama', 'mia');
			
			a.isTrue(called, 'callback for on store event never called');
		},
		
		test_On_Function_WorksWith_DotConnectedKeys: function() {
		    var called = false;
		    this.s.on('store', {
		        key: 'taco.town',
		        callback: function(type, args) {
		            called = true;
		            a.areEqual('taco.town', args.key, 'on store callback passed wrong key');
                    a.areEqual('yay', args.value, 'on store callback passed wrong value');
		        }
		    });
		    
		    this.s.store('taco.city', 'oops');
		    
		    a.isFalse(called, 'callback keyed on wrong string with dots was called');
		    
		    this.s.store('taco.town', 'yay');
		    
		    a.isTrue(called, 'callback keyed on string with dots was not called');
		},
		
		test_OnGet_CallbackIsCalled: function () {
			var called = false;
			this.s.on('get', function() {
				called = true;
			});
			
			this.s.store('mama', 'mia');
			this.s.get('mama');
			
			a.isTrue(called, 'callback for on get event never called');
		},
		
		test_OnClear_CallbackIsCalled: function () {
			var called = false;
			this.s.on('clear', function() {
				called = true;
			});
			
			this.s.clear('mama');
			
			a.isTrue(called, 'callback for on clear event never called');
		},
		
		test_OnRemove_CallbackIsCalled: function () {
			var called = false;
			this.s.on('remove', function() {
				called = true;
			});
			
			this.s.remove();
			
			a.isTrue(called, 'callback for on remove event never called');
		},
		
		test_All_Event_CallbacksAreCalledCorrectTimes: function() {
			var storeCb = 0, getCb = 0, clearCb = 0, removeCb = 0;
			this.s.on('store', function() {
				storeCb++;
			});
			this.s.on('get', function() {
				getCb++;
			});
			this.s.on('clear', function() {
				clearCb++;
			});
			this.s.on('remove', function() {
				removeCb++;
			});
			
			this.s.store('city', 'Miami');  // storeCb      = 1
			this.s.get('city');			    // getCb		= 1
			this.s.store('color', 'red');   // storeCb      = 2
			this.s.get('color');			// getCb		= 2
			this.s.clear();				    // clearCb      = 1
			this.s.remove();				// clearCb      = 2
											// removeCb     = 1
			a.areEqual(2, storeCb, 'store callback called wrong number of times');
			a.areEqual(2, getCb, 'get callback called wrong number of times');
			a.areEqual(2, clearCb, 'clear callback called wrong number of times');
			a.areEqual(1, removeCb, 'remove callback called wrong number of times');
		},
		
		test_RemoveEventFired_ForEachStore_WhenEntireStoreIsCleared: function() {
			var called = 0;
			this.s.on('remove', function() {
				called++;
			});
			var otherStore = JSDS.create();
			otherStore.on('remove', function() {
				called++;
			});
			JSDS.clear();
			a.areEqual(2, called, 'on remove callback for individual stores were not called on JSDS.clear()');
		},
		
		test_EventCallbacks_CanBeExecuted_WithinCustomScope: function() {
		    this.wrestler = 'Rowdy Rodney Piper';
			this.s.on('store', function() {
			    this.wrestler = 'Hulk Hogan';
			}, this);
			
			this.s.store('mama', 'mia');
			
			a.areEqual('Hulk Hogan', this.wrestler);
			delete this.wrestler;
		},
		
        test_StaticJSDS_OnStore_function: function() {
			var ajaxCache = JSDS.create('ajaxCache'),
				cityData = {
					"Miami": "Florida",
					"St. Louis": "Missouri",
					"Chicago": "Illinois"
				},
				retrievedCityData,
				callbackCalled = false;
		
			JSDS.on('store', {
			    id: 'ajaxCache', 
		        key: 'cityData', 
		        callback: function(type, data) {
		    	    callbackCalled = true;
				    retrievedCityData = data.value;
			    }
			});
			
			ajaxCache.store('cityData', cityData);
			
			a.isTrue(callbackCalled, 'Static JSDS callback not called on store');
			a.areSame(cityData, retrievedCityData, 'Retrieved data object was not same');
		},

		test_StaticJSDS_OnGet_function: function() {
			var ajaxCache = JSDS.create('ajaxCache'),
				cityData = {
					"Miami": "Florida",
					"St. Louis": "Missouri",
					"Chicago": "Illinois"
				},
				retrievedCityData,
				callbackCalled = false;
		
			JSDS.on('get', {
			    id:'ajaxCache', 
			    key:'cityData', 
			    callback:function(type, data) {
				    callbackCalled = true;
				    retrievedCityData = data.value;
			    }
			});
			
			ajaxCache.store('cityData', cityData);
			ajaxCache.get('cityData');
			
			a.isTrue(callbackCalled, 'Static JSDS callback not called on get');
			a.areSame(cityData, retrievedCityData, 'Retrieved data object was not same');
		},
		
		test_StaticJSDS_OnStore_ForAllStoreObjects: function() {
		    var ajaxCache = JSDS.create('ajaxCache'),
		        otherCache = JSDS.create('otherCache'),
				cityData = {
					"Miami": "Florida",
					"St. Louis": "Missouri",
					"Chicago": "Illinois"
				},
				retrievedCityData,
				callbackCalled = 0;
		
			JSDS.on('store', {
			    key:'cityData', 
			    callback: function(type, data) {
				    callbackCalled++;
				    retrievedCityData = data.value;
			    }
			});
			
			ajaxCache.store('cityData', cityData);
			otherCache.store('otherData', 'pencil');
			
			a.areEqual(1, callbackCalled, 'Static JSDS callback not called correct number of times');
			a.areSame(cityData, retrievedCityData, 'Retrieved data object was not same');
		},
		
		test_StaticJSDS_OnStore_ForAllStoreObjects_WithAnyKey: function() {
		    var ajaxCache = JSDS.create('ajaxCache'),
		        otherCache = JSDS.create('otherCache'),
				cityData = {
					"Miami": "Florida",
					"St. Louis": "Missouri",
					"Chicago": "Illinois"
				},
				retrievedCityData,
				retrievedOtherData,
				callbackCalled = 0;
		
			JSDS.on('store', {
			    callback: function(type, data) {
				    callbackCalled++;
				    if (callbackCalled === 1) {
    				    retrievedCityData = data.value;
				    } else {
				        retrievedOtherData = data.value;
				    }
			    }
			});
			
			ajaxCache.store('cityData', cityData);
			otherCache.store('otherData', 'pencil');
			
			a.areEqual(callbackCalled, 2, 'Static JSDS callback not called correct number of times');
			a.areSame(cityData, retrievedCityData, 'Retrieved data object was not same');
		},
		
		test_StoresFireEvents_ToEventHandlers_CreatedBeforeStoreWasCreated: function() {
		    var called = false;
		    JSDS.on('store', {
		        callback: function() {
		            called = true;
		        }
		    });
		    
		    var s = JSDS.create();
		    
		    s.store('color', 'red');
		    
		    a.isTrue(called, 'Callback was never called for store created after event handler attached!');
		},
		
		test_RemovingStore_DeletesStaticListeners_MatchingStoreId: function() {
		    var s = JSDS.create('removeTest');
		    
		    JSDS.on('store', {
		        id: 'removeTest',
		        callback: function() {}
		    });
		    
		    var numListeners = JSDS._listeners.store.length;
		    
		    s.remove();
		    delete s;
		    
		    a.areEqual((numListeners - 1), JSDS._listeners.store.length, 'Removing store did not remove static listeners!');
		},
		
		testProperCallbackCalledOnUpdate: function() {
			var val = {
				animals: {
					reptiles: {
						turtles: ['Victor']
					},
					mammals: {
						primates: {
							humans: {
								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
							}
						},
						dogs: ['Sasha', 'Ann-Marie']
					}
				}
			};
			
			this.s.store('stuff', val);
			
			var dogCallbackCalled = false;
			
			this.s.on('store', {
				key: 'stuff.animals.mammals.dogs',
				callback: function(type, args) {
					dogCallbackCalled = true;
					a.isArray(args.value);
					aa.contains('Buttons', args.value);
					aa.contains('Teela', args.value);
					aa.contains('Sasha', args.value);
					aa.contains('Ann-Marie', args.value);
				}
			});
			
			this.s.store('stuff.animals', {
				reptiles: {
					turtles: ['slowie']
				}
			}, {update: true});
			
			a.isFalse(dogCallbackCalled, 'callback was called when no dog data was updated');
			
			this.s.store('stuff.animals', {
				mammals: {
					dogs: ['Buttons', 'Teela']
				}
			}, {update: true});
			
			a.isTrue(dogCallbackCalled, 'callback was not called for dog update');
		},
		
		testUpdateWillOverwriteAndCreateNew: function() {
		    var val = {
				animals: {
					reptiles: {
						turtles: ['Victor']
					},
					mammals: {
						primates: {
							humans: {
								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
							}
						},
						dogs: ['Sasha', 'Ann-Marie']
					}
				}
			};
			
			this.s.store('stuff', val, {update: true});
			
			var res = this.s.get('stuff.animals.reptiles');
			
			a.areEqual(val.animals.reptiles, res, 'got wrong object back');
			
		},
		
		testSimpleWildcard_FirstPosition: function () {
			var called = false;
			this.s.on('store', {
				key: '*.map.content',
				callback: function(type, args) {
					called = true;
					a.areEqual('63336.map.content', args.value.key);
					a.areEqual('yoyoyo', args.value.value);
				}
			});
			this.s.store('63336', {
				map: {
					content: 'yoyoyo'
				}
			});
			a.isTrue(called);
		},
		
		testSimpleWildcard_FirstPosition_negative: function () {
			var called = false;
			this.s.on('store', {
				key: '*.map.content',
				callback: function(type, args) {
					called = true;
				}
			});
			this.s.store('63336', {
				map: {
					not_content: 'yoyoyo'
				}
			});
			a.isFalse(called);
		},
		
		testSimpleWildcard_MiddlePosition: function () {
			var called = false;
			this.s.on('store', {
				key: '63336.*.content',
				callback: function(type, args) {
					called = true;
				}
			});
			this.s.store('63336', {
				map: {
					content: 'yoyoyo'
				}
			});
			a.isTrue(called);
		},
		
		testSimpleWildcard_WhenStoringInDeepKey: function () {
			var called = false;
			this.s.store('animals', {
				frogs: {
					number: 11,
					area: 'north'
				},
				lizards: {
					number: 24,
					area: 'east'
				},
				veggies: {
					cucumbers: {
						area: 'west'
					}
				}
			});
			
			this.s.on('store', {
				key: 'animals.*.number',
				callback: function(type, args) {
					called = true;
				}
			});
			this.s.store('animals.lizards.number', 40);
			a.isTrue(called);
		},

		
		testUsingWildcardInKey: function() {
            var called = 0;
		    var val = {
				animals: {
					frogs: {
					    number: 11,
					    area: 'north'
					},
					lizards: {
					    number: 24,
					    area: 'east'
					}
				},
				veggies: {
				    cucumbers: {
				        area: 'west'
				    }
				}
			};
			
			this.s.store('stuff', val);
			
			this.s.on('store', {
			    key: 'stuff.*.*.area', 
			    callback: function(type, args) {
			        called++;
					a.isObject(args);
					a.isString(args.value);
					a.isArray(args.keys);
					if (called === 1) {
						a.areEqual(4, args.keys.length);
						a.areEqual('stuff', args.keys[0]);
						a.areEqual('stuff.animals', args.keys[1]);
						a.areEqual('stuff.animals.frogs', args.keys[2]);
						a.areEqual('stuff.animals.frogs.area', args.keys[3]);
						a.areEqual('south', args.value);
						a.areEqual('stuff.animals.frogs.area', args.keys[0]);
					}
			    }
			});
			
			this.s.store('stuff.animals.frogs.area', 'south');
			
			a.areEqual(1, called, 'callback not called');
			
			this.s.store('stuff.veggies.squash.area', 'east');
			
			a.areEqual(2, called, 'callback not called');
			
			this.s.store('stuff.veggies.squash.number', 444);
			
			a.areEqual(2, called, 'callback not called');
		},
		/*
		testUsingWildcard_AsFirstThing_InKey: function() {
            var called = 0,
				val = {
					animals: {
						frogs: {
						    number: 11,
						    area: 'north'
						},
						lizards: {
						    number: 24,
						    area: 'east'
						}
					},
					veggies: {
					    cucumbers: {
					        area: 'west'
					    }
					}
				},
				otherval = {animals:{frogs:{area:30}}};
			
			this.s.store('stuff', val);
			this.s.store('otherstuff', otherval);
			
			this.s.on('store', {
			    key: '*.animals.frogs.area', 
			    callback: function(type, args) {
			        called++;
					a.isObject(args);
					a.areEqual('south', args.value, 'cb for mutli-matching wildcard sent wrong array values');
					a.areEqual(30, val[1], 'cb for mutli-matching wildcard sent wrong array values');
					a.isArray(keys);
					a.areEqual(1, keys.length);
					a.areEqual('stuff.animals.frogs.area', keys[0]);
				}
			});
			
			this.s.store('stuff.animals.frogs.area', 'south');
			
			a.areEqual(1, called, 'callback not called');
			
			this.s.store('stuff.veggies.squash.area', 'east');
			
			a.areEqual(1, called, 'callback should not have been called');
		}
		*/
	}));
	
	
	Y.Test.Runner.add(suite);
 
});