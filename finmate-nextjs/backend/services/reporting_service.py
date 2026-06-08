from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from typing import List, Dict
import datetime

def generate_briefing(news_data: List[Dict], portfolio: List[str]) -> bytes:
    """
    Generates a PDF briefing.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = styles['Title']
    story.append(Paragraph(f"Senhor Finanças Daily Briefing - {datetime.date.today()}", title_style))
    story.append(Spacer(1, 12))

    # Portfolio Summary
    story.append(Paragraph("Portfolio Overview", styles['Heading2']))
    story.append(Paragraph(f"Tracking: {', '.join(portfolio)}", styles['Normal']))
    story.append(Spacer(1, 12))

    # News Analysis
    story.append(Paragraph("Market Insights", styles['Heading2']))
    
    import html
    
    for item in news_data:
        # Sanitize inputs to prevent XML parsing errors
        headline = html.escape(item.get('headline', 'No Title'))
        impact = html.escape(item.get('impact', 'neutral'))
        impact_reason = html.escape(item.get('impact_reason', 'N/A'))
        
        # Headline
        story.append(Paragraph(f"<b>{headline}</b>", styles['Heading3']))
        
        # Details
        impact_color = "black"
        if item.get('impact') == 'positive':
            impact_color = "green"
        elif item.get('impact') == 'negative':
            impact_color = "red"
            
        details = f"""
        <b>Impact:</b> <font color='{impact_color}'>{impact.upper()}</font><br/>
        <b>Score:</b> {item.get('sentiment_score', 50)}/100<br/>
        <b>Reason:</b> {impact_reason}
        """
        story.append(Paragraph(details, styles['Normal']))
        story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
