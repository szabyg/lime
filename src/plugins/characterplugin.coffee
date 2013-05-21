class window.CharacterPlugin extends window.LimePlugin
  init: ->
    @name = 'CharacterPlugin'
    @characterOntologySet = [
        "<http://dbpedia.org/ontology/FictionalCharacter>",
        "<http://dbpedia.org/class/yago/FictionalCharactersFromCalifornia>",
        "<http://dbpedia.org/class/yago/FictionalCharacter109587565>"]
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia") > 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      isCharacter = false
      typeSet = annotation.getType()

      for annotationType in typeSet
         isCharacter = true if annotationType.id in @characterOntologySet

      if isCharacter
        nonConcept = annotation.getDescription()
        nonConcept = nonConcept.replace("No description found.","")
        if(nonConcept.length >= 3)
          widget = @lime.allocateWidgetSpace @,
            thumbnail: "img/info.png" # should go into CSS
            title: "#{annotation.getLabel()} Info"
            type: "CharacterWidget"
            sortBy: ->
              10000 * annotation.start + annotation.end

          # We're going to need the annotation for the widget's `activate` event
          widget.annotation = annotation
          # widget was activated, we show details now
          jQuery(widget).bind 'activate', (e) =>
            # @getModalContainer().html @showAbstractInModalWindow annotation
            @showAbstractInModalWindow annotation, @getModalContainer()

          # Hang the widget on the annotation
          annotation.widgets[@name] = widget

          jQuery(annotation).bind "becomeActive", (e) =>
            annotation.widgets[@name].setActive()

          jQuery(annotation).bind "becomeInactive", (e) =>
            annotation.widgets[@name].setInactive()

          @getLSIImages annotation
          jQuery(widget).bind "leftarrow", (e) =>
            console.info 'left arrow pressed', e


  getLSIImages: (annotation) ->
    @lime.cmf.getLSIImagesForTerm annotation.resource.value, (err, res) =>
      if err
        console.warn "Error getting LSI images resources", err
      else
        console.info "LSI resources for", annotation, res
        annotation.lsiImageResources = _(res).map (resultset) ->
          entity =
            image: resultset.image.value
          entity

        annotation.getLsiImagesResources = ->
          @lsiImageResources


  # Widget-specific detail-rendering
  showAbstractInModalWindow: (annotation, outputElement) ->
    modalContent = $(outputElement)
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    label = annotation.getLabel()
    page = annotation.getPage()

    ###
    -- added 29.apr.2013 --
     LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
     example:
     LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)

    a LSIImages can have the following structure:
    LSIImages = [
                  {
                  image:"imageURI",
                  hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                  },

                  {
                  image:"imageURI",
                  hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                  },
                  ...
                ]
    ###

    lime = this.lime
    comment = annotation.getDescription()
    ###
    maintext = comment
    secondarytext = ""
    if (maintext.length >= 240)
      n = maintext.length
      if maintext.length >= 240
        tmptext = maintext.split(" ")
        n = tmptext.length
        textsum = ""
        i = 0
        while textsum.length < 200
          textsum += tmptext[i] + " "
          i++
        maintext = textsum
        y = i
        while y < n
          secondarytext += tmptext[y] + " "
          y++
    ###
    depiction = annotation.getDepiction(without: 'thumb')
    if(depiction == null)
      depiction = "img/noimagenew.png"
    lsiImageList = annotation.getLsiImagesResources()
    console.log "Asociated images ",label ,lsiImageList

    ###
      -- added 29.apr.2013 --
      Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images

    if(secondarytext.length > 2)
      if(lsiImageList.length >0)
        result = """
                 <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;">
                 <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{comment}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                 </div>

                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>

                 <div id="infoSecondText" style=" display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;">
        #{secondarytext}
                 </div>

                 <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{lsiImageList[0].image}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px;"></div>


                 </div>
                 """
      else
        result = """
                 <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;">
                 <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{comment}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                 </div>

                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>

                 <div id="infoSecondText" style="display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;">
        #{secondarytext}
                 </div>

                 <div id="infoSecondPic" style=" background-repeat: no-repeat; background-image: url('#{depiction}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; opacity: 0;"></div>


                 </div>
                 """
    else
      if(lsiImageList.length >0)
        result = """
                 <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                 <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                 </div>

                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>

                 <div id="infoSecondText" style="font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;">

                 </div>

                 <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{lsiImageList[0].image}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: block;"></div>


                 </div>
                 """
      else
        result = """
                 <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                 <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                 </div>

                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>

                 <div id="infoSecondText" style="font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;">

                 </div>

                 <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{depiction}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: none;"></div>


                 </div>
                 """
    ###
    result = """
             <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative;height: auto; width: 600px;">
             <div id="infoWidget" style="background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;">
                 <div class="infoWidgeticon" style="border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;">
                    <span data-dojo-type="shapes.Text" id="iconLabel" style="font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;">i</span>
                 </div>
                 <div class="infoWidgetTitle" style="font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;">
                 #{label}</div>
                 </div>
             <div id="infoText" style="padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;">
                 <div id="infoTextBioTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;">
                 Bio</div>
                 <div id="infoTextBio" style="font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;">
                 #{comment}
                 </div>
                 <div id="infoTextCareerTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                 Movies</div>
                 <div id="infoTextCareer" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
                 The Big Bang Theory</div>
                 <div id="infoTextAwardsTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                 Awards</div>
                 <div id="infoTextAwards" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
                 Spaghetti Master</div>
             </div>
             </div>
             """
    modalContent.append result
