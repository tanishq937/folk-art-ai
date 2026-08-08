import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.shapes import MSO_CONNECTOR

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return RGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))

# Color Palette
BG_COLOR = hex_to_rgb('FFFFFF')
DEEP_BLUE = hex_to_rgb('1E3A8A')
GOLD = hex_to_rgb('D4AF37')
DARK_GRAY = hex_to_rgb('4B5563')
LIGHT_GRAY = hex_to_rgb('F3F4F6')

HEADING_FONT = 'Poppins'
BODY_FONT = 'Calibri'

def apply_text_styling(paragraph, font_name, font_size, color, bold=False, align=PP_ALIGN.LEFT):
    paragraph.alignment = align
    for run in paragraph.runs:
        run.font.name = font_name
        run.font.size = Pt(font_size)
        run.font.color.rgb = color
        run.font.bold = bold

def add_background_and_accents(slide):
    # Set background color
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

    # Add accent bar (Bottom Deep Blue, thin Gold line above it)
    left = Inches(0)
    top = Inches(7.1)
    width = Inches(10)
    height = Inches(0.4)
    rect1 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    rect1.fill.solid()
    rect1.fill.fore_color.rgb = DEEP_BLUE
    rect1.line.fill.background()
    
    top_gold = Inches(7.0)
    height_gold = Inches(0.1)
    rect2 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top_gold, width, height_gold)
    rect2.fill.solid()
    rect2.fill.fore_color.rgb = GOLD
    rect2.line.fill.background()

def create_title_slide(prs, title, subtitle, notes):
    slide = prs.slides.add_slide(prs.slide_layouts[6]) # Blank
    add_background_and_accents(slide)
    
    # Large Deep Blue box for Title area
    rect = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1), Inches(10), Inches(3.5))
    rect.fill.solid()
    rect.fill.fore_color.rgb = DEEP_BLUE
    rect.line.fill.background()
    
    # Title Text
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(9), Inches(1.5))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.add_paragraph()
    p.text = title.upper()
    apply_text_styling(p, HEADING_FONT, 44, GOLD, bold=True, align=PP_ALIGN.CENTER)
    
    # Subtitle Text
    txBox_sub = slide.shapes.add_textbox(Inches(0.5), Inches(3), Inches(9), Inches(1))
    tf_sub = txBox_sub.text_frame
    tf_sub.word_wrap = True
    p_sub = tf_sub.add_paragraph()
    p_sub.text = subtitle
    apply_text_styling(p_sub, HEADING_FONT, 24, BG_COLOR, align=PP_ALIGN.CENTER)
    
    # Key Points below
    points = [
        "🤖 AI-powered Folk Art Recognition",
        "🔍 Explainable AI",
        "✅ Authenticity Detection",
        "🏛️ Cultural Heritage Preservation"
    ]
    
    txBox_pts = slide.shapes.add_textbox(Inches(1.5), Inches(5), Inches(7), Inches(2))
    tf_pts = txBox_pts.text_frame
    for pt in points:
        p = tf_pts.add_paragraph()
        p.text = pt
        apply_text_styling(p, BODY_FONT, 18, DARK_GRAY, bold=True, align=PP_ALIGN.CENTER)
        p.space_after = Pt(10)
        
    # Presenter Notes
    notes_slide = slide.notes_slide
    notes_slide.notes_text_frame.text = notes

def create_content_slide(prs, title, content_lines, notes, draw_diagram_func=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_background_and_accents(slide)
    
    # Title
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(1))
    tf = txBox.text_frame
    p = tf.add_paragraph()
    p.text = title
    apply_text_styling(p, HEADING_FONT, 36, DEEP_BLUE, bold=True)
    
    # Gold divider line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(1.3), Inches(3), Inches(0.05))
    line.fill.solid()
    line.fill.fore_color.rgb = GOLD
    line.line.fill.background()
    
    # Content
    if content_lines:
        content_width = Inches(4.5) if draw_diagram_func else Inches(8.5)
        txBox_content = slide.shapes.add_textbox(Inches(0.5), Inches(1.8), content_width, Inches(4.5))
        tf_content = txBox_content.text_frame
        tf_content.word_wrap = True
        
        for i, line_text in enumerate(content_lines):
            if i == 0:
                p = tf_content.paragraphs[0]
            else:
                p = tf_content.add_paragraph()
            p.text = "• " + line_text if not line_text.startswith(('►', '✔', '❌', '✅', '1.', '2.', '3.')) else line_text
            apply_text_styling(p, BODY_FONT, 20, DARK_GRAY)
            p.space_after = Pt(15)
            
    if draw_diagram_func:
        draw_diagram_func(slide)
        
    # Presenter Notes
    notes_slide = slide.notes_slide
    notes_slide.notes_text_frame.text = notes

def draw_s4_diagram(slide):
    # System Overview
    labels = ["1. Style\nClassification", "2. Authenticity\nDetection", "3. Explainable\nAI", "4. Similarity\nSearch", "5. Cultural\nInfo"]
    for i, label in enumerate(labels):
        x = Inches(5.5)
        y = Inches(1.5 + i * 1.1)
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.5), Inches(0.8))
        shape.fill.solid()
        shape.fill.fore_color.rgb = DEEP_BLUE
        shape.line.fill.background()
        tf = shape.text_frame
        p = tf.paragraphs[0]
        p.text = label
        apply_text_styling(p, HEADING_FONT, 16, BG_COLOR, bold=True, align=PP_ALIGN.CENTER)

def draw_s3_diagram(slide):
    # Workflow diagram
    boxes = ["Upload\nImage", "AI\nProcessing", "Results"]
    for i, label in enumerate(boxes):
        x = Inches(5.0 + i*1.6)
        y = Inches(3.0)
        shape = slide.shapes.add_shape(MSO_SHAPE.HEXAGON, x, y, Inches(1.4), Inches(1.2))
        shape.fill.solid()
        shape.fill.fore_color.rgb = GOLD
        shape.line.fill.background()
        p = shape.text_frame.paragraphs[0]
        p.text = label
        apply_text_styling(p, HEADING_FONT, 14, DEEP_BLUE, bold=True, align=PP_ALIGN.CENTER)
        
        if i < 2:
            arr = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, x + Inches(1.4), y + Inches(0.5), Inches(0.2), Inches(0.2))
            arr.fill.solid()
            arr.fill.fore_color.rgb = DEEP_BLUE

def draw_s6_diagram(slide):
    # CNN vs Random Forest
    y = Inches(2.5)
    
    shape1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5), y, Inches(2), Inches(1))
    shape1.fill.solid()
    shape1.fill.fore_color.rgb = hex_to_rgb('EF4444') # Red
    p1 = shape1.text_frame.paragraphs[0]
    p1.text = "CNN Approach ❌\n(55-60%)"
    apply_text_styling(p1, HEADING_FONT, 16, BG_COLOR, bold=True, align=PP_ALIGN.CENTER)
    
    shape2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.5), y, Inches(2), Inches(1))
    shape2.fill.solid()
    shape2.fill.fore_color.rgb = hex_to_rgb('10B981') # Green
    p2 = shape2.text_frame.paragraphs[0]
    p2.text = "Random Forest ✅\n(91%)"
    apply_text_styling(p2, HEADING_FONT, 16, BG_COLOR, bold=True, align=PP_ALIGN.CENTER)

def draw_s11_diagram(slide):
    stack = [("React", "Frontend"), ("FastAPI", "Backend"), ("PyTorch", "Deep Learning"), ("Scikit-learn", "Machine Learning"), ("OpenCV", "Image Processing")]
    for i, (tech, layer) in enumerate(stack):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.5), Inches(1.5 + i*1.0), Inches(3.5), Inches(0.8))
        shape.fill.solid()
        shape.fill.fore_color.rgb = DEEP_BLUE if i % 2 == 0 else GOLD
        shape.line.fill.background()
        p = shape.text_frame.paragraphs[0]
        p.text = f"{tech} ({layer})"
        color = BG_COLOR if i % 2 == 0 else DEEP_BLUE
        apply_text_styling(p, HEADING_FONT, 16, color, bold=True, align=PP_ALIGN.CENTER)

def draw_s10_diagram(slide):
    # Charts abstraction
    shape1 = slide.shapes.add_shape(MSO_SHAPE.DONUT, Inches(5.5), Inches(2.5), Inches(1.8), Inches(1.8))
    shape1.fill.solid()
    shape1.fill.fore_color.rgb = DEEP_BLUE
    p1 = slide.shapes.add_textbox(Inches(5.5), Inches(4.5), Inches(1.8), Inches(0.5)).text_frame.paragraphs[0]
    p1.text = "Style\n90%"
    apply_text_styling(p1, HEADING_FONT, 16, DARK_GRAY, bold=True, align=PP_ALIGN.CENTER)
    
    shape2 = slide.shapes.add_shape(MSO_SHAPE.DONUT, Inches(7.8), Inches(2.5), Inches(1.8), Inches(1.8))
    shape2.fill.solid()
    shape2.fill.fore_color.rgb = GOLD
    p2 = slide.shapes.add_textbox(Inches(7.8), Inches(4.5), Inches(1.8), Inches(0.5)).text_frame.paragraphs[0]
    p2.text = "Authenticity\n91%"
    apply_text_styling(p2, HEADING_FONT, 16, DARK_GRAY, bold=True, align=PP_ALIGN.CENTER)

def main():
    prs = Presentation()
    # Ensure wide format 16:9
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    # 1. Title
    create_title_slide(
        prs, 
        "Indian Folk Art Intelligence System", 
        "Style Classification & Authenticity Detection",
        "Good morning everyone. Today I am presenting my project, Indian Folk Art Intelligence System. This AI-powered application identifies Indian folk art styles, predicts authenticity, explains its decisions using Explainable AI, and provides cultural information about each artwork."
    )
    
    # 2. Problem Statement
    create_content_slide(
        prs,
        "Problem Statement",
        [
            "Identifying different Indian folk art styles is difficult for untrained eyes.",
            "Online marketplaces are flooded with counterfeit artworks.",
            "Buyers have no reliable way to verify authenticity.",
            "Lack of mainstream awareness about India's traditional art forms."
        ],
        "Explain the two major problems: 1. Style identification 2. Authenticity verification."
    )
    
    # 3. Project Objective
    create_content_slide(
        prs,
        "Project Objective",
        [
            "Upload one painting image and automatically:",
            "► Identify Art Style",
            "► Detect Authenticity",
            "► Explain AI Prediction",
            "► Find Similar Paintings",
            "► Display Cultural Information"
        ],
        "Explain that a single uploaded image generates multiple intelligent outputs.",
        draw_s3_diagram
    )
    
    # 4. System Overview
    create_content_slide(
        prs,
        "System Overview",
        [
            "Five integrated intelligent modules.",
            "End-to-end pipeline from image upload to insights.",
            "Seamless integration of Deep Learning and Machine Learning."
        ],
        "Briefly explain how all modules work together.",
        draw_s4_diagram
    )
    
    # 5. Style Classification
    create_content_slide(
        prs,
        "Style Classification",
        [
            "Model: ResNet18 CNN (Transfer Learning)",
            "Dataset: 8 distinct Indian Folk Art Styles",
            "Why CNN?",
            "  • Learns shapes, textures, colors, and artistic patterns.",
            "Accuracy: 90% on unseen data."
        ],
        "Explain CNN in simple words and mention transfer learning with ResNet18."
    )
    
    # 6. Authenticity Detection
    create_content_slide(
        prs,
        "Authenticity Detection",
        [
            "Initial Approach: CNN (55–60% accuracy)",
            "Problem: CNN ignored fine texture differences.",
            "Final Approach: Extract image features",
            "  • Sharpness, Color richness",
            "  • Edge density, Noise patterns",
            "Classifier: Random Forest",
            "Final Accuracy: 91%"
        ],
        "Explain why changing the approach improved performance significantly.",
        draw_s6_diagram
    )
    
    # 7. Explainable AI
    create_content_slide(
        prs,
        "Explainability using Grad-CAM",
        [
            "AI predictions must be transparent and trustworthy.",
            "Grad-CAM generates visual attention heatmaps.",
            "Highlights specific regions influencing the prediction.",
            "Transforms the model from a 'black box' to an interpretable system."
        ],
        "Explain that the model shows WHY it made the prediction."
    )
    
    # 8. Similarity Search
    create_content_slide(
        prs,
        "Similarity Search",
        [
            "Extracts deep image embeddings from the CNN.",
            "Compares the uploaded artwork against the entire dataset.",
            "Retrieves visually and stylistically similar paintings.",
            "Acts as a powerful discovery engine (like 'You May Also Like')."
        ],
        "Compare it with 'You May Also Like' recommendations."
    )
    
    # 9. Cultural Information
    create_content_slide(
        prs,
        "Cultural Context Engine",
        [
            "Displays rich metadata for each predicted style:",
            "  • History & State of Origin",
            "  • Traditional Significance",
            "  • Symbolism & Artistic Characteristics",
            "Bridges the gap between technical AI and cultural education."
        ],
        "Emphasize education and cultural preservation."
    )
    
    # 10. Results
    create_content_slide(
        prs,
        "Results & Evaluation",
        [
            "Rigorous testing on unseen validation data.",
            "Style Classification Accuracy: 90%",
            "Authenticity Detection Accuracy: 91%",
            "High confidence and recall across multiple folk art classes."
        ],
        "Discuss the achieved accuracy and testing methodology.",
        draw_s10_diagram
    )
    
    # 11. Technology Stack
    create_content_slide(
        prs,
        "Technology Stack",
        [
            "A full-stack, production-ready AI application.",
            "Microservices architecture separating ML and web layers.",
            "Real-time inference and responsive UI."
        ],
        "Explain how all technologies integrate into a full-stack AI application.",
        draw_s11_diagram
    )
    
    # 12. Conclusion
    create_content_slide(
        prs,
        "Conclusion & Future Scope",
        [
            "Project Achievements:",
            "✔ AI-based Style Classification & Authenticity Verification",
            "✔ Explainable AI, Similarity Search, Cultural Education",
            "Future Scope:",
            "► Include more folk art styles and larger datasets",
            "► Develop a mobile application",
            "► Museum integration and Marketplace verification"
        ],
        "Conclude by explaining that the project combines AI with Indian cultural heritage to create a practical, educational, and trustworthy system."
    )
    
    output_path = "Indian_Folk_Art_Premium_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == '__main__':
    main()
