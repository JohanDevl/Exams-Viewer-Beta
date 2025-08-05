#!/usr/bin/env python3
"""
Scraper batch optimisé spécifiquement pour ServiceNow
Lit le manifest pour récupérer tous les examens ServiceNow et les traite en un seul passage
"""

import os
import sys
import json
import time
import random
import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from collections import defaultdict

# Add the scripts directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scraper import HEADERS, respectful_request, scrape_questions, save_json, load_json

class ServiceNowProgress:
    """Progress tracker optimisé pour ServiceNow"""
    def __init__(self, description=""):
        self.description = description
        
    def progress(self, value, text=""):
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] ServiceNow: {text}")

def load_servicenow_exams_from_manifest():
    """
    Charge tous les examens ServiceNow depuis le manifest
    """
    print("📋 Loading ServiceNow exams from manifest...")
    
    manifest_path = "public/data/manifest.json"
    if not os.path.exists(manifest_path):
        print("❌ Manifest not found")
        return []
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        
        exam_codes = [exam['code'] for exam in manifest.get('exams', [])]
        print(f"✅ Found {len(exam_codes)} ServiceNow exams in manifest")
        print(f"📝 Exams: {', '.join(sorted(exam_codes))}")
        
        return exam_codes
        
    except Exception as e:
        print(f"❌ Error reading manifest: {e}")
        return []

def batch_collect_servicenow_links(target_exam_codes, progress):
    """
    Collecte tous les liens ServiceNow en un seul passage sur les pages
    Optimisé pour cibler uniquement les examens du manifest
    """
    print(f"\n🚀 Batch collecting ServiceNow links for {len(target_exam_codes)} exams...")
    
    PREFIX = "https://www.examtopics.com/discussions/"
    SERVICENOW_CATEGORY = "servicenow"  # Catégorie ServiceNow sur ExamTopics
    
    # Structure pour collecter les liens par exam
    exam_links = defaultdict(list)
    
    # URL de base pour ServiceNow
    base_url = f"{PREFIX}{SERVICENOW_CATEGORY}/"
    
    # Obtenir le nombre total de pages ServiceNow
    response = respectful_request(base_url)
    if not response:
        raise Exception("Unable to access ServiceNow pages")
    
    soup = BeautifulSoup(response.content, "html.parser")
    page_indicator = soup.find("span", class_="discussion-list-page-indicator")
    if not page_indicator:
        raise Exception("Page indicator not found")
    
    strong_tags = page_indicator.find_all("strong")
    if len(strong_tags) < 2:
        raise Exception("Unexpected page indicator format")
    
    num_pages = int(strong_tags[1].text)
    print(f"📄 {num_pages} ServiceNow pages to analyze")
    
    # Convertir la liste des examens cibles en set pour recherche rapide
    target_exam_set = set(target_exam_codes)
    
    # Parcourir toutes les pages ServiceNow une seule fois
    for page_num in range(1, num_pages + 1):
        page_url = f"{base_url}{page_num}/"
        progress.progress(
            page_num / num_pages, 
            f"Analyzing page {page_num}/{num_pages} - Collecting ServiceNow links"
        )
        
        page_response = respectful_request(page_url)
        if not page_response:
            print(f"⚠️  Failed page {page_num}, moving to next")
            continue
        
        soup = BeautifulSoup(page_response.content, "html.parser")
        titles = soup.find_all("div", class_="dicussion-title-container")
        
        # Analyser chaque discussion sur cette page
        for title in titles:
            if not title.text:
                continue
            
            title_text = title.text.strip()
            
            # Chercher les patterns d'examens ServiceNow
            if "Exam " in title_text:
                # Extraire le code d'examen du titre (support des minuscules pour CIS-Discovery)
                exam_match = re.search(r'Exam\s+([A-Za-z0-9-]+)', title_text)
                if exam_match:
                    exam_code = exam_match.group(1)
                    
                    # Vérifier si c'est un des examens qu'on veut
                    if exam_code in target_exam_set:
                        a_tag = title.find("a")
                        if a_tag and "href" in a_tag.attrs:
                            link = a_tag["href"]
                            exam_links[exam_code].append(link)
        
        # Délai respectueux entre les pages
        if page_num < num_pages:
            delay = random.uniform(2, 4)
            time.sleep(delay)
    
    # Trier les liens pour chaque examen par numéro de question
    for exam_code in exam_links:
        exam_links[exam_code] = sorted(
            exam_links[exam_code], 
            key=lambda link: int(re.search(r'question-(\d+)', link).group(1)) if re.search(r'question-(\d+)', link) else 0
        )
    
    # Statistiques
    total_links = sum(len(links) for links in exam_links.values())
    found_exams = len(exam_links)
    missing_exams = len(target_exam_set) - found_exams
    
    print(f"\n📊 Collection results:")
    print(f"   ✅ Exams found: {found_exams}/{len(target_exam_codes)}")
    print(f"   📝 Total links collected: {total_links}")
    
    if missing_exams > 0:
        missing_list = target_exam_set - set(exam_links.keys())
        print(f"   ⚠️  Exams not found: {', '.join(sorted(missing_list))}")
    
    return dict(exam_links), num_pages

def dispatch_servicenow_links(exam_links, target_exam_codes, total_pages):
    """
    Dispatche les liens collectés vers les dossiers d'examens ServiceNow
    """
    print(f"\n📨 Dispatching ServiceNow links...")
    
    dispatched_count = 0
    updated_count = 0
    
    for exam_code in target_exam_codes:
        links = exam_links.get(exam_code, [])
        
        if not links:
            print(f"⚠️  {exam_code}: No links found")
            continue
        
        exam_dir = f"public/data/{exam_code}"
        os.makedirs(exam_dir, exist_ok=True)
        
        links_path = f"{exam_dir}/links.json"
        
        # Créer l'objet links.json optimisé
        links_obj = {
            "page_num": total_pages,
            "status": "complete", 
            "links": links,
            "collected_at": datetime.now().isoformat(),
            "method": "servicenow_batch_collection",
            "exam_code": exam_code,
            "links_count": len(links)
        }
        
        try:
            save_json(links_obj, links_path)
            
            # Vérifier si c'est une mise à jour ou création
            exam_json_path = f"{exam_dir}/exam.json"
            if os.path.exists(exam_json_path):
                updated_count += 1
                status = "updated"
            else:
                dispatched_count += 1
                status = "created"
            
            print(f"✅ {exam_code}: {len(links)} links → {status}")
            
        except Exception as e:
            print(f"❌ {exam_code}: Save error - {e}")
    
    print(f"\n📊 Dispatch summary:")
    print(f"   🆕 New exams: {dispatched_count}")
    print(f"   🔄 Updated exams: {updated_count}")
    
    return dispatched_count + updated_count

def process_servicenow_questions(exam_codes, progress, force_update=False):
    """
    Traite les questions pour tous les examens ServiceNow
    """
    print(f"\n📝 Processing ServiceNow questions for {len(exam_codes)} exams...")
    
    results = []
    successful = 0
    failed = 0
    total_questions_processed = 0
    
    for i, exam_code in enumerate(exam_codes):
        print(f"\n📚 ServiceNow exam {i+1}/{len(exam_codes)}: {exam_code}")
        
        exam_dir = f"public/data/{exam_code}"
        links_path = f"{exam_dir}/links.json"
        questions_path = f"{exam_dir}/exam.json"
        
        # Charger les liens pré-collectés
        links_obj = load_json(links_path)
        if not links_obj or not links_obj.get("links"):
            print(f"❌ {exam_code}: Missing links")
            failed += 1
            continue
        
        links = links_obj["links"]
        print(f"📄 {len(links)} questions to process for {exam_code}")
        
        try:
            # Progress tracker spécifique à cet examen
            class ExamProgress:
                def __init__(self, exam_code):
                    self.exam_code = exam_code
                    
                def progress(self, value, text=""):
                    timestamp = datetime.now().strftime('%H:%M:%S')
                    print(f"[{timestamp}] {self.exam_code}: {text}")
            
            exam_progress = ExamProgress(exam_code)
            
            # Utiliser le scraper existant pour les questions
            questions_obj = scrape_questions(
                links, 
                questions_path, 
                exam_progress, 
                rapid_scraping=False,  # Mode respectueux
                force_update=force_update
            )
            
            questions = questions_obj.get("questions", [])
            error = questions_obj.get("error", "")
            
            if error:
                print(f"⚠️  {exam_code}: {error}")
                print(f"   📝 {len(questions)} questions retrieved despite error")
            
            result = {
                'exam_code': exam_code,
                'status': 'success' if not error else 'partial',
                'question_count': len(questions),
                'error': error if error else None
            }
            
            results.append(result)
            successful += 1
            total_questions_processed += len(questions)
            
            print(f"✅ {exam_code}: {len(questions)} questions processed successfully")
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ {exam_code}: Exception - {error_msg}")
            results.append({
                'exam_code': exam_code,
                'status': 'failed',
                'question_count': 0,
                'error': error_msg
            })
            failed += 1
        
        # Pause respectueuse entre examens
        if i < len(exam_codes) - 1:
            print(f"⏳ 15s pause before next exam...")
            time.sleep(15)
    
    print(f"\n📊 Final ServiceNow summary:")
    print(f"   ✅ Successful exams: {successful}")
    print(f"   ❌ Failed exams: {failed}")
    print(f"   📝 Questions processed: {total_questions_processed}")
    
    return results

def main():
    """Main function pour le scraper ServiceNow optimisé"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scraper batch optimisé pour ServiceNow')
    parser.add_argument('--links-only', action='store_true', 
                        help='Collecte des liens uniquement')
    parser.add_argument('--questions-only', action='store_true',
                        help='Traitement des questions uniquement (utilise liens existants)')
    parser.add_argument('--force-update', action='store_true',
                        help='Force la mise à jour des questions existantes')
    parser.add_argument('--exam', type=str,
                        help='Traiter uniquement un examen spécifique')
    
    args = parser.parse_args()
    
    print("🚀 Optimized ServiceNow Batch Scraper")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🎯 Targeting: ServiceNow exams from manifest")
    
    progress = ServiceNowProgress("ServiceNow Batch")
    
    try:
        # Charger les examens ServiceNow du manifest
        target_exam_codes = load_servicenow_exams_from_manifest()
        if not target_exam_codes:
            print("❌ No ServiceNow exams found in manifest")
            return 1
        
        # Filtrer sur un examen spécifique si demandé
        if args.exam:
            if args.exam in target_exam_codes:
                target_exam_codes = [args.exam]
                print(f"🎯 Processing specific exam: {args.exam}")
            else:
                print(f"❌ Exam {args.exam} not found in ServiceNow manifest")
                print(f"📋 Available exams: {', '.join(sorted(target_exam_codes))}")
                return 1
        
        if args.questions_only:
            # Traitement des questions uniquement
            print("📝 Mode: Questions only (pre-existing links)")
            results = process_servicenow_questions(target_exam_codes, progress, args.force_update)
            
        else:
            # Collecte des liens (phase 1)
            print("🔗 Phase 1: Batch collecting ServiceNow links")
            exam_links, total_pages = batch_collect_servicenow_links(target_exam_codes, progress)
            
            if not exam_links:
                print("❌ No ServiceNow links collected")
                return 1
            
            # Dispatch des liens (phase 2)
            print("📨 Phase 2: Dispatching links")
            dispatched = dispatch_servicenow_links(exam_links, target_exam_codes, total_pages)
            
            if not args.links_only:
                # Traitement des questions (phase 3)
                print("📝 Phase 3: Processing questions")
                results = process_servicenow_questions(target_exam_codes, progress, args.force_update)
        
        # Mise à jour du manifest si traitement des questions
        if not args.links_only:
            print(f"\n🔄 Updating ServiceNow manifest...")
            try:
                from update_manifest import generate_manifest, validate_manifest, save_manifest
                
                manifest = generate_manifest()
                if manifest and validate_manifest(manifest) and save_manifest(manifest):
                    print(f"✅ ServiceNow manifest updated successfully")
                else:
                    print(f"⚠️  Failed to update manifest")
            except Exception as e:
                print(f"⚠️  Manifest error: {str(e)}")
        
        print(f"\n🎉 ServiceNow scraper completed successfully!")
        return 0
        
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())